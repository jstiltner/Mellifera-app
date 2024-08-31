const mongoose = require('mongoose');
const sharedSchema = require('./SharedSchema');

const ApiarySchema = new mongoose.Schema(
  {
    ...sharedSchema.tree,
    name: { type: String, required: true },
    location: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    hiveCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ApiarySchema.virtual('hives', {
  ref: 'Hive',
  localField: '_id',
  foreignField: 'parent',
});

ApiarySchema.virtual('user', {
  ref: 'User',
  localField: 'parent',
  foreignField: '_id',
  justOne: true,
});

// Add a pre-find hook to automatically populate the 'hives' virtual
ApiarySchema.pre('find', function () {
  this.populate('hives');
});

ApiarySchema.pre('findOne', function () {
  this.populate('hives');
});

const Apiary = mongoose.model('Apiary', ApiarySchema);
module.exports = Apiary;
