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
 watched:[String],
 wantToWatch: [String],
 ratedShows: [{
  showId: String,
  rating: Number, 
}], 
// favorites: { type: [String], default: [] },
// });
favorites: [{
  showId: String, 
  title: String,
  posterPath: String
}]
});





const User = mongoose.model('User', userSchema);


module.exports = User;







