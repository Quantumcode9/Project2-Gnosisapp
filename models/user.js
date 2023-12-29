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


const User = mongoose.model('User', userSchema);

module.exports = User;





