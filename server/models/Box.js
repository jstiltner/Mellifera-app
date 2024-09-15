const mongoose = require('mongoose');
const sharedSchema = require('./SharedSchema');

const { Schema } = mongoose;

const BoxSchema = new Schema({
  ...sharedSchema.tree,
  boxNumber: { type: Number, required: false },
  type: { type: String, required: false, enum: ['brood', 'honey'] },
  frames: { type: Number, required: false },
  parentHive: { type: Schema.Types.ObjectId, ref: 'Hive' },
  childFrames: [{ type: Schema.Types.ObjectId, ref: 'Frame' }],
  updated: { type: Date, default: Date.now },
  broodFrameCount: { type: Number },
  cappedBroodFrameCount: { type: Number },
  condition: { type: String },
  honeyFrameCount: { type: Number },
  pollenFrameCount: { type: Number },
  beeBreadFrameCount: { type: Number },
  beeSleeveCount: { type: Number },
  droneCombToFreeze: { type: Number },

  // Additional fields from HiveDetails and ApiaryDetails
  name: { type: String },
  status: { type: String },
  queenPresent: { type: Boolean },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  queenId: { type: String },
  lastInspection: { type: Date },
});

// Update the updatedAt field on save
BoxSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Box = mongoose.model('Box', BoxSchema);

module.exports = Box;
