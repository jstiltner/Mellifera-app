const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    condition: {
      type: String,
      required: true,
      enum: ['New', 'Good', 'Fair', 'Poor', 'Needs Replacement'],
      default: 'Good',
    },
    lastUsed: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;
