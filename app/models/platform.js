'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;
const trackable = require('mongoose-trackable');

let Platform = new Schema({
  shortName: Types.String,
  name: Types.String,
  gamerProfileUrlPrefix: Types.String
}).plugin(trackable);

module.exports = mongoose.model('Platform', Platform);
