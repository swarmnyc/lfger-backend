'use strict';
const express = require('express');
const async = require('async');

module.exports = function(app) {
  const router = express.Router();

  router.param('user', function(req, res, next, id) {
    req.db.User.findById(id).exec(function(err, user) {
      if (err) {
        return next(err);
      }

      req.models.user = user;
      next();
    });
  });

  // router.get('/', app.middleware.ensureLogin, function(req, res) {
  //   req.db.User.find().exec(function(err, users) {
  //     if (err) {
  //       return res.status(403).json({ success: false, error: err.message });
  //     }
  //
  //     return res.status(200).json(users);
  //   });
  // });

  router.post('/', function(req, res, next) {
    let data = req.body;
    let user;

    if (!data) {
      return res.status(403).json({ error: 'No data'});
    }

    user = new req.db.User(data);

    user.save(function(err, doc) {
      if (err) {
        if (err.name === 'ValidationError') {
          return res.status(403).json({ success: false, error: err.message });
        }

        return next(err);
      }

      res.status(200).json(doc);
    });
  });

  // router.get('/:user', app.middleware.ensureLogin, function(req, res) {
  //   res.status(200).json(req.models.user);
  // });

  // router.put('/:user', app.middleware.ensureLogin, function(req, res) {
  //   let data = req.body;
  //   let user = req.models.user;
  //
  //   if (!data) {
  //     return res.status(403).json({ success: false, error: 'No data' });
  //   }
  //
  //   async.each(Object.keys(data), function(key, callback) {
  //     user[key] = data[key];
  //     callback();
  //   }, function() {
  //     user.save(function(err, doc) {
  //       if (err) {
  //         return res.status(403).json({ success: false, error: err.message });
  //       }
  //
  //       res.status(200).json(doc);
  //     });
  //   });
  // });

  // router.delete('/:user', app.middleware.ensureLogin, function(req, res) {
  //   req.models.user.remove(function(err) {
  //     if (err) {
  //       return res.status(403).json({ success: false });
  //     }
  //
  //     res.status(200).json({ success: true });
  //   });
  // });

  return router;
};
