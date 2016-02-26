'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;
const trackable = require('mongoose-trackable');
const paginate = require('mongoose-paginate');
const softDelete = require('mongoose-softer-delete');

let LFG = new Schema({
  platform: { type: Types.ObjectId, required: true, ref: 'Platform' },
  game: { type: Types.String, required: true, index: true },
  gamerId: { type: Types.String, required: true, index: true },
  message: { type: Types.String },
  willPostTo: {
    facebook: { type: Types.Boolean, default: false },
    twitter: { type: Types.Boolean, default: false }
  },
  isFlagged: { type: Types.Boolean, default: false }
});

LFG.plugin(trackable);
LFG.plugin(paginate);
LFG.plugin(softDelete);

module.exports = mongoose.model('LFG', LFG);
