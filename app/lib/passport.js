'use strict';
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const User = require('../models/user');

module.exports = function(app) {
  passport.use(new LocalStrategy(
  function(username, password, callback) {
      User.findOne({ email: username }).exec(function(err, user) {
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
            app.logger.info('Validation failed for ' + username + ': invalid password');
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
    User.findById(id).exec(function(err, user) {
      if (err) {
        return callback(err);
      }

      callback(null, user);
    });
  });

  passport.use(new BearerStrategy(
    function(token, done) {
      User.find({ bearerToken: token }).limit(1).exec(function(err, user) {
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
