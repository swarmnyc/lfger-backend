'use strict';
const express = require('express');
const async = require('async');

module.exports = function(app) {
  const router = express.Router();

  router.param('platform', function(req, res, next, id) {
      req.db.Platform.findById(id).exec(function(err, platform) {
        if (err) {
          return next(err);
        }

        req.models.platform = platform;
        return next();
      });
  });

  router.get('/', function(req, res) {
    req.db.Platform.find().exec(function(err, platforms) {
      if (err) {
        return res.status(403).json({ error: err.message });
      }

      res.status(200).json(platforms);
    });
  });

  // router.post('/', app.middleware.ensureLogin, function(req, res) {
  //   let data = req.body;
  //   let platform;
  //
  //   if (!data) {
  //     return res.status(403).json({ error: 'No data provided' });
  //   }
  //
  //   platform = new req.db.Platform(data);
  //
  //   platform.save(function(err, doc) {
  //     if (err) {
  //       return res.status(403).json({ error: err.message });
  //     }
  //
  //     res.status(200).json(doc);
  //   });
  // });

  router.get('/:platform', function(req, res) {
    res.status(200).json(req.models.platform);
  });

  // router.put('/:platform', function(req, res) {
  //   let data = req.body;
  //   let platform = req.models.platform;
  //
  //   if (!data) {
  //     return res.status(403).json({ error: 'No data provided' });
  //   }
  //
  //   async.each(Object.keys(data), function(key, callback) {
  //     platform[key] = data[key];
  //     callback();
  //   }, function() {
  //     platform.save(function(err, doc) {
  //       if (err) {
  //         return res.status(403).json({ error: err.message });
  //       }
  //
  //       res.status(200).json(doc);
  //     });
  //   });
  // });

  // router.delete('/:platform', function(req, res) {
  //   req.models.platform.remove(function(err) {
  //     if (err) {
  //       return res.status(403).json({ success: false, error: err.message });
  //     }
  //
  //     res.status(200).json({ success: true });
  //   });
  // });

  return router;
};
