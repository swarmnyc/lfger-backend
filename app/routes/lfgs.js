'use strict';
const express = require('express');
const async = require('async');
const _ = require('underscore');

module.exports = function() {
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
    let options = ['game', 'platform', 'gamerId'];

    _.each(options, function(option) {
      if (req.query[option] && req.query[option] !== '') {
        query[option] = req.query[option];
      }
    });

    req.db.LFG.find(query).populate('platform').exec(function(err, lfgs) {
      if (err) {
        return res.status(403).json({ success: false, error: err.message });
      }

      res.status(200).json(lfgs);
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
    req.models.lfg.remove().then(function() {
      res.status(200).json({ success: true });
    }).catch(function(err) {
      res.status(403).json({ success: false, error: err.message });
    });
  });

  return router;

};
