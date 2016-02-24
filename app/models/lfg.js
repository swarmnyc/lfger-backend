'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;
const trackable = require('mongoose-trackable');

let Comment = new Schema({
  gamerId: { type: Types.String, index: true },
  message: { type: Types.String }
});

Comment.plugin(trackable);

let LFG = new Schema({
  platform: { type: Types.ObjectId, required: true, ref: 'Platform', index: true },
  game: { type: Types.String, required: true, index: true },
  gamerId: { type: Types.String, required: true, index: true },
  message: { type: Types.String },
  comments: { type: [Comment] },
  willPostTo: {
    facebook: { type: Types.Boolean, default: false },
    twitter: { type: Types.Boolean, default: false }
  }
}).plugin(trackable);

module.exports = mongoose.model('LFG', LFG);
