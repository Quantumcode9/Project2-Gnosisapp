const mongoose = require('mongoose');
require('dotenv').config();

const showSchema = new mongoose.Schema({

 title: {
     type: String,
     required: true,
    trim: true
   },
   genre: [{
     type: String,
   required: true
   }],
  description: {
    type: String,
    required: true
   },
   airDates: [Date], // Array of air dates
   seasons: [{
    seasonNumber: Number,
     episodes: [String]
  }],
  artworkUrl: String // URL to the show's artwork
});

const Show = mongoose.model('Show', showSchema);

module.exports = Show;

