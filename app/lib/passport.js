'use strict';
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const AdminUser = require('../models/admin-user');

module.exports = function(app) {
  passport.use(new LocalStrategy(
  function(email, password, callback) {
      AdminUser.findOne({ email: email }).exec(function(err, user) {
        if (err) {
          return callback(err);
        }

        if (!user) {
          return callback(null, false);
        }

        user.comparePassword(password, function(err, isMatch) {
          if (err) {
            return callback(err);
          }

          if (!isMatch) {
            return callback(null, false);
          }

          return callback(null, user);
        });
      });
  }));

  passport.serializeUser(function(user, callback) {
    callback(null, user._id.toString());
  });

  passport.deserializeUser(function(id, callback) {
    AdminUser.findById(id).exec(function(err, user) {
      if (err) {
        return callback(err);
      }

      callback(null, user);
    });
  });

  app.use(passport.initialize());
  app.use(passport.session());

  return passport;
};
