'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;
const trackable = require('mongoose-trackable');

let GameSystem = new Schema({
  shortName: Types.String,
  name: Types.String,
  gamerUrlPath: Types.String
}).plugin(trackable);

module.exports = mongoose.model('GameSystem', GameSystem);
