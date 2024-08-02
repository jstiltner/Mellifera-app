const mongoose = require('mongoose');
const sharedSchema = require('./SharedSchema');

const ParentSchema = new SharedSchema();
const BoxSchema = new Schema({
    ...ParentSchema.obj,
    fromChild: Boolean,
    id: { type: String, required: true, unique: true },
    parentHive: Schema.Types.ObjectId,
    childFrames: [Schema.Types.ObjectId],
    updated: { type: Date, default: Date.now},
    broodFrameCount: { type: Number },
    cappedBroodFrameCount: { type: Number },
    condition: { type: string },
    // hasLarvae: { type: Boolean },
    // hasEggs: { type: Boolean },
    // hasQueen: { type: Boolean },
    // hasQueenCellsCapped: { type: Boolean },
    // hasQueenCellsOpen: { type: Boolean },
    honeyFrameCount: { type: Number },
    pollenFrameCount: { type: Number },
    beeBreadFrameCount: { type: Number },
    beeSleeveCount: { type: Number },
    frameCount: { type: Number },
    droneCombToFreeze: { type: Number }
    });

export const Box = mongoose.model('Box', BoxSchema);

//const box1 = new Box();
const box1=Box();
box1.swapWith(box2);
