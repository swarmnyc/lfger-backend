'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;
const trackable = require('mongoose-trackable');

let Platform = new Schema({
  shortName: { type: Types.String, index: true },
  name: { type: Types.String, index: true },
  gamerProfileUrlPrefix: { type: Types.String }
}).plugin(trackable);

module.exports = mongoose.model('Platform', Platform);
