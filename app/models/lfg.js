'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;
const trackable = require('mongoose-trackable');

let LFG = new Schema({
  gameSystem: { type: Types.ObjectId, required: true, ref: 'GameSystem' },
  game: { type: Types.String, required: true },
  gamerTag: { type: Types.String, required: true },
  message: Types.String,
  willPostTo: {
    facebook: { type: Types.Boolean, default: false },
    twitter: { type: Types.Boolean, default: false }
  }
}).plugin(trackable);

module.exports = mongoose.model('LFG', LFG);
