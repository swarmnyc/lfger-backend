'use strict';
const express = require('express');

module.exports = function() {
  const router = express.Router();

  router.get('/', (req, res) => {
    if (!req.user) {
      req.flash('warning', 'You are not logged in');
      return res.redirect('/login');
    }

    req.logout();
    req.flash('success', 'Come back soon!');
    res.redirect('/login');
  });

  return router;
};
