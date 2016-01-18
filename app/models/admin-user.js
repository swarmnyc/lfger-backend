'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;
const trackable = require('mongoose-trackable');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const SALT_WORK_FACTOR = 10;

const validateEmail = function(email) {
  return validator.isEmail(email);
};

let AdminUser = new Schema({
  name: { type: Types.String },
  email: { type: Types.String, validate: validateEmail },
  password: { type: Types.String, required: true },
  bearerToken: { type: Types.String }
}).plugin(trackable);

AdminUser.pre('save', function(next) {
  let user = this;

  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) {
        return next(err);
      }

      user.password = hash;
      next();
    });
  });
});

AdminUser.pre('save', function(next) {
  if (this.isNew || !this.bearerToken || this.bearerToken === '') {
    this.bearerToken = crypto.randomBytes(32).toString('hex');
  }

  next();
});

AdminUser.methods.comparePassword = function(passwordInput, callback) {
  bcrypt.compare(passwordInput, this.password, callback);
};

module.exports = mongoose.model('AdminUser', AdminUser);
