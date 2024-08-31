const SharedSchema = require('./SharedSchema');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const HiveSchema = new Schema({
  ...SharedSchema.tree,
  name: { type: String, required: false },
  queenId: { type: String },
  status: { type: String },
  notes: { type: String },
  children: [{ type: Schema.Types.ObjectId, ref: 'Box' }],
  inspections: [{ type: Schema.Types.ObjectId, ref: 'Inspection', default: [] }],
  hasInnerCover: {
    type: Boolean,
    default: false,
  },
  topCoverType: {
    type: String,
    enum: ['Migratory', 'Telescoping'],
  },
  hasRobberScreen: {
    type: Boolean,
    default: false,
  },
  isInsulated: {
    type: Boolean,
    default: false,
  },
  hasCandyBoard: {
    type: Boolean,
    default: false,
  },
  lastFeedDate: {
    type: Date,
  },
  foodType: {
    type: String,
    enum: ['1:1 Syrup', '2:1 Syrup', 'Pollen Patties'],
  },
  miteCount: {
    type: Number,
  },
  miteCountSampleSize: {
    type: Number,
  },
  treatmentType: {
    type: String,
    enum: ['Oxyalic Acid', 'ApiGuard', 'Thymol'],
  },
  treatmentDate: {
    type: Date,
  },
  treatmentRoundsTotal: {
    type: Number,
  },
  signsOfRobbing: {
    type: Boolean,
    default: false,
  },
  reducedEntrance: {
    type: Boolean,
    default: false,
  },
  treatmentRound: {
    type: Number,
  },
});

HiveSchema.virtual('apiary', {
  ref: 'Apiary',
  localField: 'parent',
  foreignField: '_id',
  justOne: true,
});

// Pre-find hook to populate the 'children' field with full box documents
// and the most recent 3 inspections
HiveSchema.pre('find', async function (next) {
  this.populate('children');
  this.populate({
    path: 'inspections',
    options: { sort: { date: -1 }, limit: 3 }
  });
  next();
});

HiveSchema.pre('findOne', async function (next) {
  this.populate('children');
  this.populate({
    path: 'inspections',
    options: { sort: { date: -1 }, limit: 3 }
  });
  next();
});

module.exports = mongoose.model('Hive', HiveSchema);
