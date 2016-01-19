'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;
const trackable = require('mongoose-trackable');

let Game = new Schema({
  name: { type: Types.String },
  aliases: { type: [String] }
}).plugin(trackable);

module.exports = mongoose.model('Game', Game);
