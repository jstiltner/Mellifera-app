const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeedingSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['1:1 Syrup', '2:1 Syrup', 'Pollen Patties', 'Candy Board', 'Other'],
  },
  amount: {
    type: Number,
    required: true,
  },
  units: {
    type: String,
    required: true,
    enum: ['liters', 'kg', 'grams'],
  },
  notes: {
    type: String,
  },
  hive: {
    type: Schema.Types.ObjectId,
    ref: 'Hive',
    required: true,
  },
});

module.exports = mongoose.model('Feeding', FeedingSchema);
