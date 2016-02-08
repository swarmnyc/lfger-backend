'use strict';
const express = require('express');

module.exports = function(app) {
  const router = express.Router();

  router.get('/', function(req, res) {
    res.render('admin/index', { title: 'LFGer Admin' });
  });

  router.post('/', function(req, res) {
    let data = req.body;
    let adminUser;

    if (!data) {
      return res.status(403).json({ success: false, error: 'Empty request' });
    }

    adminUser = new req.db.User(data);
    adminUser.save(function(err, doc) {
      if (err) {
        app.logger.error(err);
        return res.status(403).json({ success: false, error: err.message });
      }

      return res.status(200).json(doc);
    });
  });

  return router;
};
