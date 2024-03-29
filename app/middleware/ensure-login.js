'use strict';
const _   =   require('underscore');

module.exports = function() {
  return function(req, res, next) {
    if (!req.user) {
      return res.redirect('/login');
    }
    return next();
  };
};
