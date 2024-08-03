const mongoose = require('mongoose');
const { Schema } = mongoose;

const sharedSchema = new Schema({
  parent: { type: Schema.Types.ObjectId },
  children: [{ type: Schema.Types.ObjectId }],
  updated: { type: Date, default: Date.now }
});

sharedSchema.methods.swapWith = async function(swapMateId) {  
  
  // Method to swap this another peer
    // update child arrays on parent objects
    try {
      const swapMate = await mongoose.Model.findById(swapMateId);
      if (!swapMate) throw new Error('swapMateId not found');

    const currentParent = this.parent;
    const swapParent = swapMate.parent;

    // Update the parent of the current thing
    this.parent = swapParent;
    await this.save();

    // Update the parent of the swapMate thing
    swapMate.parent = currentParent;
    await swapMate.save();

    // Update children arrays of the respective parents
    if (currentParent) {
      await mongoose.Model.findByIdAndUpdate(currentParent, {
        $pull: { children: this._id },
        $addToSet: { children: swapMate._id }
      });
    }

    if (swapParent) {
      await mongoose.Model.findByIdAndUpdate(swapParent, {
        $pull: { children: swapMate._id },
        $addToSet: { children: this._id }
      });
    }

    return { success: true, message: "Swap successful" };
  } catch (error) {
    return { success: false, message: error.message };
  }
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