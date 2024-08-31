const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  email: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
});

dataSchema.statics.getAll = async function () {
  return this.find({});
};

dataSchema.statics.getOne = async function (id) {
  return this.findById(id);
};

dataSchema.statics.updateOne = async function (id, updateData) {
  return this.findByIdAndUpdate(id, updateData, { new: true });
};

dataSchema.statics.deleteOne = async function (id) {
  return this.findByIdAndDelete(id);
};

module.exports = mongoose.model('Data', dataSchema);
