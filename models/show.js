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
  logo_path: String,
  name: String,
  origin_country: String
});

const seasonSchema = new mongoose.Schema({
  air_date: Date,
  id: Number,
  name: String,
  overview: String,
  poster_path: String,
  season_number: Number,
  vote_average: Number
});

const showSchema = new mongoose.Schema({
  poster_path: String,
  first_air_date: Date,
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }], // Assuming you have a Genre model
  homepage: String,
  id: { type: Number, unique: true, required: true },
  in_production: Boolean,
  languages: [String],
  last_air_date: Date,
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

