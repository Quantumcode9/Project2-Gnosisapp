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

  // genrePreferences: [{
  //   type: String
  // }],
  favorites: [String],
  watched:[String],
   wantToWatch: [String]
});

const User = mongoose.model('User', userSchema);


module.exports = User;







