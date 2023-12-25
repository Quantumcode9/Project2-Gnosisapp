const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();

  this.password = bcrypt.hashSync(this.password, 8);
  next();
});

// Method to check the entered password against the hashed one
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;





