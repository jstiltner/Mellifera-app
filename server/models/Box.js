const mongoose = require('mongoose');
const sharedSchema = require('./SharedSchema');

const { Schema } = mongoose;

const BoxSchema = new Schema({
  ...sharedSchema.tree,
  fromChild: Boolean,
  boxNumber: { type: String, required: false, unique: true },
  parentHive: Schema.Types.ObjectId,
  childFrames: [Schema.Types.ObjectId],
  updated: { type: Date, default: Date.now },
  broodFrameCount: { type: Number },
  cappedBroodFrameCount: { type: Number },
  condition: { type: String },
  honeyFrameCount: { type: Number },
  pollenFrameCount: { type: Number },
  beeBreadFrameCount: { type: Number },
  beeSleeveCount: { type: Number },
  frameCount: { type: Number },
  droneCombToFreeze: { type: Number },
});

const Box = mongoose.model('Box', BoxSchema);

module.exports = Box;
