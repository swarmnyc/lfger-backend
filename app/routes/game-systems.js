'use strict';
const express = require('express');
const async = require('async');

module.exports = function(app) {
  const router = express.Router();

  router.param('gameSystem', function(req, res, next, id) {
      req.db.GameSystem.findById(id).exec(function(err, gameSystem) {
        if (err) {
          return next(err);
        }

        req.models.gameSystem = gameSystem;
        return next();
      });
  });

  router.get('/', function(req, res) {
    req.db.GameSystem.find().exec(function(err, gameSystems) {
      if (err) {
        return res.status(403).json({ error: err.message });
      }

      res.status(200).json(gameSystems);
    });
  });

  router.post('/', app.middleware.ensureLogin, function(req, res) {
    let data = req.body;
    let gameSystem;

    if (!data) {
      return res.status(403).json({ error: 'No data provided' });
    }

    gameSystem = new req.db.GameSystem(data);

    gameSystem.save(function(err, doc) {
      if (err) {
        return res.status(403).json({ error: err.message });
      }

      res.status(200).json(doc);
    });
  });

  router.get('/:gameSystem', function(req, res) {
    res.status(200).json(req.models.gameSystem);
  });

  router.put('/:gameSystem', function(req, res) {
    let data = req.body;
    let gameSystem = req.models.gameSystem;

    if (!data) {
      return res.status(403).json({ error: 'No data provided' });
    }

    async.each(Object.keys(data), function(key, callback) {
      gameSystem[key] = data[key];
      callback();
    }, function() {
      gameSystem.save(function(err, doc) {
        if (err) {
          return res.status(403).json({ error: err.message });
        }

        res.status(200).json(doc);
      });
    });
  });

  router.delete('/:gameSystem', function(req, res) {
    req.models.gameSystem.remove(function(err) {
      if (err) {
        return res.status(403).json({ success: false, error: err.message });
      }

      res.status(200).json({ success: true });
    });
  });

  return router;
};
