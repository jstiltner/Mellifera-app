const mongoose = require('mongoose');
const { Schema } = mongoose;
const SharedSchema = require('./SharedSchema');

const InspectionSchema = new Schema({
  ...SharedSchema.tree,
  hive: {
    type: Schema.Types.ObjectId,
    ref: 'Hive',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  notes: {
    type: String,
  },
  // Add more fields as needed based on future requirements
});

// Middleware to update the Hive's most recent inspection
async function updateHiveMostRecentInspection(inspection) {
  const Hive = mongoose.model('Hive');
  await Hive.updateMostRecentInspection(inspection.hive, inspection._id);
}

// Post-save middleware
InspectionSchema.post('save', async function (doc, next) {
  await updateHiveMostRecentInspection(doc);
  next();
});

// Post-update middleware
InspectionSchema.post('findOneAndUpdate', async function (doc, next) {
  if (doc) {
    await updateHiveMostRecentInspection(doc);
  }
  next();
});

module.exports = mongoose.model('Inspection', InspectionSchema);
