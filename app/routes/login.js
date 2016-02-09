'use strict';
const express = require('express');

module.exports = function(app) {
  const router = express.Router();

  router.post('/', app.middleware.auth.local, function(req, res) {
      res.redirect('/');
  });

  router.get('/', app.middleware.flash, function(req, res) {    
    res.render('admin/index');
  });

  return router;
};
