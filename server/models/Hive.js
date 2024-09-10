const SharedSchema = require('./SharedSchema');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const TreatmentSchema = new Schema({
  type: { type: String, required: true },
  dose: { type: String, required: true },
  date: { type: Date, required: true },
  weatherConditions: { type: String, required: true },
});

const HiveSchema = new Schema({
  ...SharedSchema.tree,
  name: { type: String, required: false },
  queenId: { type: String },
  status: { type: String },
  notes: { type: String },
  children: [{ type: Schema.Types.ObjectId, ref: 'Box' }], // Array of references to Box documents
  inspections: [{ type: Schema.Types.ObjectId, ref: 'Inspection', default: [] }], // Array of references to Inspection documents
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
  treatmentHistory: [TreatmentSchema], // New field for treatment history
});

HiveSchema.virtual('apiary', {
  ref: 'Apiary',
  localField: 'parent',
  foreignField: '_id',
  justOne: true,
});

// Pre-find hook to populate the 'children' field with full box documents
// and the three most recent inspections
HiveSchema.pre('find', function (next) {
  this.populate('children');
  this.populate({
    path: 'inspections',
    options: { sort: { date: -1 }, limit: 15 }
  });
  next();
});

HiveSchema.pre('findOne', function (next) {
  this.populate('children');
  this.populate({
    path: 'inspections',
    options: { sort: { date: -1 }, limit: 15 }
  });
  next();
});

module.exports = mongoose.model('Hive', HiveSchema);
