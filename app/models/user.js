'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;
const trackable = require('mongoose-trackable');
const softDelete = require('mongoose-softer-delete');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const SALT_WORK_FACTOR = 10;

let User = new Schema({
  name: { type: Types.String },
  email: { type: Types.String, validate: validator.isEmail },
  password: { type: Types.String },
  bearerToken: { type: Types.String },
  role: { type: Types.String, default: 'user', required: true, validate: function(v) {
    let options = ['admin', 'user'];
    return options.indexOf(v) >= 0;
  }}
});

User.plugin(trackable);
User.plugin(softDelete);

User.pre('save', function(next) {
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

User.pre('save', function(next) {
  if (this.isNew || !this.bearerToken || this.bearerToken === '') {
    this.bearerToken = crypto.randomBytes(32).toString('hex');
  }

  next();
});

User.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

User.methods.comparePassword = function(passwordInput, callback) {
  bcrypt.compare(passwordInput, this.password, callback);
};

module.exports = mongoose.model('User', User);
