'use strict';

module.exports = function(app) {
  return {
    local: [
      app.passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function(req, res, next) {
        return next();
      }
    ],
    bearer: [
      app.passport.authenticate('bearer', { session: false }), function(req, res, next) {
        return next();
      }
    ]
  };
};
