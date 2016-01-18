'use strict';
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const AdminUser = require('../models/admin-user');

module.exports = function(app) {
  passport.use(new LocalStrategy(
  function(username, password, callback) {
      AdminUser.findOne({ email: username }).exec(function(err, user) {
        if (err) {
          app.logger.error('Validation failed for ' + username + ': ' + err);
          return callback(err);
        }

        if (!user) {
          app.logger.info('Validation failed for ' + username + ': no such user');
          return callback(null, false);
        }

        user.comparePassword(password, function(err, isMatch) {
          if (err) {
            app.logger.error('Validation failed for ' + username + ': password validation failed because ' + err);
            return callback(err);
          }

          if (!isMatch) {
            app.logger.error('Validation failed for ' + username + ': invalid password');
            return callback(null, false);
          }

          return callback(null, user);
        });
      });
  }));

  passport.serializeUser(function(user, callback) {
    callback(null, user._id);
  });

  passport.deserializeUser(function(id, callback) {
    AdminUser.findById(id).exec(function(err, user) {
      if (err) {
        return callback(err);
      }

      callback(null, user);
    });
  });

  passport.use(new BearerStrategy(
    function(token, done) {
      AdminUser.findOne({ bearerToken: token }).exec(function(err, user) {
        if (err) {
          app.logger.error('Token validation failed: ' + err.message);
          return done(err);
        }

        if (!user) {
          app.logger.info('Token validation failed: Invalid token');
          return done(null, false);
        }

        return done(null, user, { scope: 'all' });
      });
    }
  ));

  app.use(passport.initialize());
  app.use(passport.session());

  return passport;
};
