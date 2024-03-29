const mongoose = require('mongoose');
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
  favorites: [{
    id: String,
    name: String,
    poster_path: String,
    rating: String,
    last_air_date: Date
  }],
watched: [{
  id: String,
  name: String,
  poster_path: String,
  rating: String,
  last_air_date: Date,
  user_rating: Number
}],
watchlist: [{
  id: String,
  name: String,
  poster_path: String,
  rating: String,
  last_air_date: Date
}],

});

const User = mongoose.model('User', userSchema);


module.exports = User;







