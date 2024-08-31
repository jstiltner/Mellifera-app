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

module.exports = mongoose.model('Inspection', InspectionSchema);
