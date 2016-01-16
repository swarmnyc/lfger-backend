'use strict';
module.exports = function(app) {
  return function(req, res, next) {
    req.db = app.db;
    req.models = {};
    return next();
  };
};
