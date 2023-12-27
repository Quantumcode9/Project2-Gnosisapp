const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  genrePreferences: [{
    type: String
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show'
  }],
  watched: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show'
  }],
  wantToWatch: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show'
  }]
});
// Pre-save hook to hash password before saving user document
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check the entered password against the hashed one
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;





