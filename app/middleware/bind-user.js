'use strict';
const _   =   require('underscore');

module.exports = function() {
  return function(req, res, next) {
    if (!req.user) {
      return next();
    }
    if (!res.locals) {
      res.locals = {};
    }
    res.locals.loggedInUser = _.omit(req.user, 'password');
    return next();
  };
};
