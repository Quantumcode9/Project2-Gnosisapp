const mongoose = require('mongoose');
require('dotenv').config();

const showSchema = new mongoose.Schema({
  showId: String,
 title: {
     type: String,
     required: true,
   },
   imageUrl: {
    type: String,
    required: true
},
   airDates: [Date], // Array of air dates
   seasons: [{
    seasonNumber: Number,
    episodes: [String]
  }],
});

const Show= mongoose.model('Show', showSchema);

module.exports = Show;

