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
    last_episode_to_air: Object,
    next_episode_to_air: Object,
  }],
watched: [{
  id: String,
  name: String,
  poster_path: String,
  rating: String,
  last_episode_to_air: Object,
  next_episode_to_air: Object,
  user_rating: Number
}],
watchlist: [{
  id: String,
  name: String,
  poster_path: String,
  rating: String,
  last_episode_to_air: Object,
  next_episode_to_air: Object 
}],
});

const User = mongoose.model('User', userSchema);
module.exports = User;