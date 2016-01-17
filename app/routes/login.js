'use strict';
const express = require('express');

module.exports = function(app) {
  const router = express.Router();

  router.post('/', app.middleware.auth, function(req, res) {
      res.redirect('/');
  });

  router.get('/', function(req, res) {
    res.render('admin/index');
  });

  return router;
};
