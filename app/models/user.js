'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;
const trackable = require('mongoose-trackable');
const validator = require('validator');

const validateEmail = function(email) {
  return validator.isEmail(email);
};

let User = new Schema({
  email: { type: Types.String, required: true, validate: {
    validator: validateEmail,
    message: '{VALUE} is not a valid email address'
  }}
}).plugin(trackable);

module.exports = mongoose.model('User', User);
