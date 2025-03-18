const mongoose = require('mongoose');
require('dotenv').config();

const watchedSchema = new mongoose.Schema({
  showId: {
    type: Number,
    required: true
  },
  user_rating: {
    type: Number,
    min: 1,
    max: 10
  }
});

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
  favorites: [Number], // Changed from ref to just Number type
  watched: [watchedSchema],
  watchlist: [Number], // Changed from ref to just Number type
});

const User = mongoose.model('User', userSchema);
module.exports = User;