'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;
const trackable = require('mongoose-trackable');

let Update = new Schema({
  filename: { type: Types.String }
}).plugin(trackable);

module.exports = mongoose.model('Update', Update);
