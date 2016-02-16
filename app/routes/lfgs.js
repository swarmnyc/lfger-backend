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
    let query = {};
    let options = ['game', 'platform', 'gamerId', 'isFlagged'];
    let pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      populate: 'platform',
      sort: { createdAt: -1 }
    };

    _.each(options, function(option) {
      if (req.query[option] && req.query[option] !== '') {
        query[option] = req.query[option];
      }
    });

    query.isDeleted = false;

    req.db.LFG.paginate(query, pagination, function(err, lfgs) {
      if (err) {
        return res.status(403).json({ success: false, error: err.message });
      }

      res.status(200).json(lfgs.docs);
    });
  });

  /**
   * Create a new LFG
   */
  router.post('/', function(req, res) {
    let data = req.body;
    let lfg;

    if (!data) {
      return res.status(403).json({ error: 'Empty request' });
    }

    lfg = new req.db.LFG(data);

    lfg.save(function(err, doc) {
      if (err) {
        return res.status(403).json({ error: err.message });
      }

      res.status(200).json(doc);
    });
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
  router.put('/:lfg', app.middleware.auth.bearer, function(req, res) {
    let data = req.body;
    let lfg = req.models.lfg;

    async.forEachOf(data, function(value, key, callback) {
      lfg[key] = value;
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
    req.models.lfg.remove().then(function() {
      res.status(200).json({ success: true });
    }).catch(function(err) {
      res.status(403).json({ success: false, error: err.message });
    });
  });

  return router;

};
