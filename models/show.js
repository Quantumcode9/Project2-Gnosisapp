const mongoose = require('mongoose');
require('dotenv').config();



const episodeSchema = new mongoose.Schema({
  id: Number,
  name: String,
  overview: String,
  vote_average: Number,
  vote_count: Number,
  air_date: Date,
  episode_number: Number,
  season_number: Number,
  show_id: Number
});

const networkSchema = new mongoose.Schema({
  id: Number,
  name: String,
  origin_country: String
});

const seasonSchema = new mongoose.Schema({
  air_date: Date,
  id: Number,
  name: String,
  overview: String,
  season_number: Number,
  vote_average: Number
});

const showSchema = new mongoose.Schema({
  poster_path: String,
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
  homepage: String,
  id: { type: Number, unique: true, required: true },
  in_production: Boolean,
  rating: [String],
  last_air_date: {
    type: Date,
    required: false 
  },
  last_episode_to_air: episodeSchema,
  name: String,
  next_episode_to_air: episodeSchema,
  networks: [networkSchema],
  number_of_episodes: Number,
  number_of_seasons: Number,
  seasons: [seasonSchema],
  status: String,
  tagline: String,
  type: String,
  vote_average: Number,
  vote_count: Number
});

const Show= mongoose.model('Show', showSchema);

module.exports = Show;

