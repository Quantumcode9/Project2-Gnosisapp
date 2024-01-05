const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
require('dotenv').config();
const Show = require('./show'); 


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
wantToWatch: [{
    type: Schema.Types.ObjectId,
    ref: 'Show'
}],

});

const User = mongoose.model('User', userSchema);


module.exports = User;







