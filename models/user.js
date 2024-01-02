const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema2 = new mongoose.Schema({
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
  watched: [String],
  wantToWatch: [String],
  ratedShows: [{
    showId: String,
    rating: Number, 
  }],
  favorites: [{
    showId: String, 
    title: String,
    posterPath: String
  }]
});

// favorites: { type: [String], default: [] },
// });






const User = mongoose.model('User', userSchema2);


module.exports = User;







