const mongoose = require('mongoose');
const { Schema } = mongoose;
const SharedSchema = require('./SharedSchema');

const QueenSchema = new Schema({
  ...SharedSchema,
  isQueenMarked: {
    type: Boolean,
    default: false,
  },
  queenMarkColor: {
    type: String,
    enum: ['White', 'Yellow', 'Red', 'Green', 'Blue'],
  },
});

module.exports = mongoose.model('Queen', QueenSchema);
