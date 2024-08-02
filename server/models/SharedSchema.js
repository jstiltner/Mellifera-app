const mongoose = require('mongoose');
const { Schema } = mongoose;

const sharedSchema = new Schema({
  parentId: Schema.Types.ObjectId,
  children: [Schema.Types.ObjectId,],
  updated: { type: Date, default: Date.now}
});

sharedSchema.methods.swapWith = function(swapMate) {
  // swapWith peer-level object in same or different parent class object 
  // update parent fields on child objects
  // update child arrays on parent objects
}; 

  
// moveTo different parent object
sharedSchema.methods.moveTo = function(targetParent) { 
  // change parent field on child object
  // delete child from child array on old parent object
  // add child field to child array on new parent object
};

// remove from yard to inventory
sharedSchema.methods.remove = function() {
  // remove child id value from parent's child array
  // toggle parent value on child object to null / inventory
};

  
// harvest from yard, to move to harvest queue
sharedSchema.methods.harvest = function() {
   // remove child id value from parent's child array
   // add id value to harvested array
  
};

module.exports = sharedSchema;