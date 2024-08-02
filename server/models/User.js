// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// const findOrCreate = require('mongoose-findorcreate');

let UserSchema = new mongoose.Schema({
  email: { type: String, required: false, unique: true },
  password: { type: String, required: false },
  displayName: {type: String, required: false},
  facebookId: { type: String, required: false }});
  

  UserSchema.statics.findOrCreate = async function(profile, cb) {
    try {
      let user = await this.findOne({ facebookId: profile.id });
      let created = false;
  
      if (!user) {
        user = new this({
          facebookId: profile.id,
          displayName: profile.displayName,
          email: profile.emails && profile.emails[0].value // Ensure email exists
        });
        await user.save();
        created = true; // Indicate a new user was created
      }
  
      cb(null, user, created);
    } catch (err) {
      cb(err);
    }
  };
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
