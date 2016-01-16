'use strict';
const express = require('express');

module.exports = function(app) {
  const router = express.Router();

  router.post('/', app.middleware.auth, function(req, res) {
      res.status(200).send();
  });

  router.get('/', function(req, res) {
    res.status(200).send();
  });

  return router;
};
