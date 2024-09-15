const SharedSchema = require('./SharedSchema');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const HiveSchema = new Schema({
  ...SharedSchema.tree,
  name: { type: String, required: false },
  queenId: { type: String },
  status: { type: String },
  notes: { type: String },
  children: [{ type: Schema.Types.ObjectId, ref: 'Box' }], // Array of references to Box documents
  inspections: [{ type: Schema.Types.ObjectId, ref: 'Inspection', default: [] }], // Array of references to Inspection documents
  treatments: [{ type: Schema.Types.ObjectId, ref: 'Treatment', default: [] }], // Array of references to Treatment documents
  feedings: [{ type: Schema.Types.ObjectId, ref: 'Feeding', default: [] }], // New field for feedings
  lastInspection: { type: Date },
  lastTreatment: { type: Date },
  lastFeeding: { type: Date },
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
  mostRecentInspection: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection' },
});

// Static method to update the most recent inspection
HiveSchema.statics.updateMostRecentInspection = async function (hiveId, inspectionId) {
  await this.findByIdAndUpdate(hiveId, {
    mostRecentInspection: inspectionId,
    lastInspection: new Date(),
  });
};

HiveSchema.virtual('apiary', {
  ref: 'Apiary',
  localField: 'parent',
  foreignField: '_id',
  justOne: true,
});

// Pre-find hook to populate the 'children' field with full box documents
// and the most recent inspections, treatments, and feedings
HiveSchema.pre('find', function (next) {
  this.populate('children');
  this.populate({
    path: 'inspections',
    options: { sort: { date: -1 }, limit: 15 },
  });
  this.populate({
    path: 'treatments',
    options: { sort: { date: -1 }, limit: 5 },
  });
  this.populate({
    path: 'feedings',
    options: { sort: { date: -1 }, limit: 5 },
  });
  next();
});

HiveSchema.pre('findOne', function (next) {
  this.populate('children');
  this.populate({
    path: 'inspections',
    options: { sort: { date: -1 }, limit: 15 },
  });
  this.populate({
    path: 'treatments',
    options: { sort: { date: -1 }, limit: 5 },
  });
  this.populate({
    path: 'feedings',
    options: { sort: { date: -1 }, limit: 5 },
  });
  next();
});

// Pre-save hook to update lastInspection, lastTreatment, and lastFeeding
HiveSchema.pre('save', function (next) {
  if (this.inspections.length > 0) {
    this.lastInspection = this.inspections[this.inspections.length - 1].date;
  }
  if (this.treatments.length > 0) {
    this.lastTreatment = this.treatments[this.treatments.length - 1].date;
  }
  if (this.feedings.length > 0) {
    this.lastFeeding = this.feedings[this.feedings.length - 1].date;
  }
  next();
});

module.exports = mongoose.model('Hive', HiveSchema);
