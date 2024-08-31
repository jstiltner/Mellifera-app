const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const sharedSchema = require('./SharedSchema');

const UserSchema = new mongoose.Schema({
  ...sharedSchema.tree,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  displayName: { type: String, required: false },
  facebookId: { type: String, required: false },
  googleId: { type: String, required: false },
});

UserSchema.virtual('apiaries', {
  ref: 'Apiary',
  localField: '_id',
  foreignField: 'parent',
});

UserSchema.statics.findOrCreate = async function (profile, provider, cb) {
  try {
    let user = await this.findOne({
      $or: [
        { email: profile.emails && profile.emails[0].value },
        { [`${provider}Id`]: profile.id },
      ],
    });
    let created = false;

    if (!user) {
      user = new this({
        name: profile.displayName,
        email: profile.emails && profile.emails[0].value,
        displayName: profile.displayName,
        [`${provider}Id`]: profile.id,
      });
      await user.save();
      created = true;
    } else if (!user[`${provider}Id`]) {
      user[`${provider}Id`] = profile.id;
      await user.save();
    }

    cb(null, user, created);
  } catch (err) {
    cb(err);
  }
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
