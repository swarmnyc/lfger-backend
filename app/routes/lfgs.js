'use strict';
const express = require('express');
const async = require('async');
const _ = require('underscore');

module.exports = function(app) {
  const router = express.Router();

  /**
   * LFG Query Param Middleware
   */
  router.param('lfg', function(req, res, next, id) {
    req.db.LFG.findById(id).populate('platform').exec(function(err, lfg) {
      if (err) {
        return next(err);
      }

      req.models.lfg = lfg;
      return next();
    });
  });

  /**
   * Get a list of LFGs
   */
  router.get('/', function(req, res) {
    const renderResponse = function(err, lfgs) {
      if (err) {
        return res.status(403).json({ success: false, error: err });
      }

      res.status(200).json(lfgs);
    };
    let query = {};
    let options = ['game', 'platform', 'gamerId'];

    /* If platform is supplied, then use platform helper query */
    if (req.query.platform) {
      return app.helpers.lfg.findLFGsByPlatform(req.query.platform, renderResponse);
    }

    async.each(options, function(option, cb) {
      if (Object.keys(req.query).length === 0) {
        return cb();
      }

      if (req.query[option] && req.query[option] !== '') {
        /* If query is a string, convert to RegExp for case insensitive search */
        query[option] = (typeof req.query[option] === 'string' ? new RegExp(req.query[option], 'i') : req.query[option]);
      }

      cb();
    }, function() {
      req.db.LFG.find(query).populate('platform').sort(app.LFGER_CONFIG.QUERY_SORT).exec(renderResponse);
    });
  });

  /**
   * Create a new LFG
   */
  router.post('/', function(req, res) {
    let data = req.body;
    let lfg;

    if (!data) {
      return res.status(403).json({ error: 'Submitted empty response' });
    }

    if (data.platform) {
      app.helpers.platform.findPlatformByIdOrName(data.platform).then(function(platform) {
        data.platform = platform._id.toString();
        lfg = new req.db.LFG(data);

        lfg.save(function(err, doc) {
          if (err) {
            return res.status(403).json({ success: false, error: err });
          }

          res.status(200).json(doc);
        });
      }).catch(function(err) {
        res.status(403).json({ success: false, error: err });
      });
    }
  });

  /**
   * Get a specific LFG
   */
  router.get('/:lfg', function(req, res) {
    return res.status(200).json(req.models.lfg);
  });

  /**
   * Update LFG
   */
  router.put('/:lfg', function(req, res) {
    let data = req.body;
    let lfg = req.models.lfg;

    async.each(Object.keys(data), function(key, callback) {
      lfg[key] = data[key];
      callback();
    }, function() {

      lfg.save(function(err, doc) {
        if (err) {
          return res.status(403).json({ error: err.message });
        }

        res.status(200).json(doc);
      });
    });
  });

  /**
   * Remove LFG
   */
  router.delete('/:lfg', function(req, res) {
    req.models.lfg.remove(function(err) {
      if (err) {
        return res.status(403).json({ success: false, error: err.message });
      }

      return res.status(200).json({ success: true });          
    });
  });

  return router;

};
