const mongoose = require('mongoose');
const { Schema } = mongoose;

const sharedSchema = new Schema({
  // Define your schema fields here
});

sharedSchema.methods.yourMethodName = function () {
  // Your method logic here
  console.log('This is an instance method');
};

module.exports = sharedSchema;
