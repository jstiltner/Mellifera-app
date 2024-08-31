const mongoose = require('mongoose');
const sharedSchema = require('./SharedSchema');
import { Schema } from 'mongoose';

const ParentSchema = new sharedSchema();
const FrameSchema = new Schema({
  ...ParentSchema.obj,
  fromChild: Boolean,
  email: { type: String, required: false, unique: true },
  password: { type: String, required: false },
  displayName: { type: String, required: false },
  facebookId: { type: String, required: false },
});

export const Frame = mongoose.model('Frame', FrameSchema);
