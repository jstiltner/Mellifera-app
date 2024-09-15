const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TreatmentSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    dose: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    weatherConditions: {
      type: String,
      required: true,
    },
    hive: {
      type: Schema.Types.ObjectId,
      ref: 'Hive',
      required: true,
    },
    apiary: {
      type: Schema.Types.ObjectId,
      ref: 'Apiary',
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Treatment', TreatmentSchema);
