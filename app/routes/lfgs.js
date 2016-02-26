'use strict';
const express = require('express');
const async   = require('async');
const _       = require('underscore');

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

      res.status(200).json(lfgs.docs);
    };
    let query = {};
    let options = ['game', 'platform', 'gamerId', 'isFlagged'];
    let pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      populate: 'platform',
      sort: app.LFGER_CONFIG.QUERY_SORT
    };

    /* If platform is supplied, then use platform helper query */
    if (req.query.platform) {
      return app.helpers.lfg.findLFGsByPlatform(req.query.platform, pagination, renderResponse);
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
      query.isDeleted = false;
      req.db.LFG.paginate(query, pagination, renderResponse);
    });
  });

  /**
   * Create a new LFG
   */
  router.post('/', function(req, res) {
    let data = req.body;
    let lfg;

    if (!data) {
      return res.status(403).json({ success: false, error: 'Empty request' });
    }

    /* Platform is required. Return error if not provided. */
    if (!data.platform) {
      return res.status(403).json({ success: false, error: 'Missing platform'});
    }

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
  });

  /**
   * Get a specific LFG
   */
  router.get('/:lfg', function(req, res) {
    return res.status(200).json(req.models.lfg);
  });

  /**
   * Get all LFG comments (also returned on generic LFG lookup)
   */
  router.get('/:lfg/comments', function(req, res) {
    let lfg = req.models.lfg;

    res.json(lfg.comments);
  });

  /**
   * Post comment to LFG
   */
  router.post('/:lfg/comments', function(req, res) {
    let data = req.body;
    let lfg = req.models.lfg;

    lfg.comments.push(data);
    lfg.save(function(err, doc) {
      if (err) {
        if (err.name === 'ValidationError') {
          return res.status(403).json({ success: false, error: err });
        }

        return res.status(500).json({ success: false, error: err });
      }

      res.status(200).json(doc);
    });
  });

  /**
   * Get comment
   */
  router.get('/:lfg/comments/:comment', function(req, res) {
    let lfg = req.models.lfg;
    let comment = _.find(lfg.comments, function(c) {
      return c._id.equals(req.params.comment);
    });

    if (!comment) {
      return res.status(404).json({ success: 'false', error: 'Not found' });
    }

    return res.json(comment);
  });

  /**
   * Delete comment
   */
  router.delete('/:lfg/comments/:comment', function(req, res) {
    let lfg = req.models.lfg;
    lfg.pull(req.params.comment);

    lfg.save(function(err) {
      if (err) {
        return res.status(403).json({ success: false });
      }

      return res.json({ success: true });
    });
  });

  /**
   * Update LFG
   */
  router.put('/:lfg', app.middleware.auth.bearer, function(req, res) {
    let data = req.body;
    let lfg = req.models.lfg;

    async.forEachOf(data, function(value, key, callback) {
      lfg[key] = value;
      callback();
    }, function() {

      lfg.save(function(err, doc) {
        if (err) {
          return res.status(403).json({ success: false, error: err.message });
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
