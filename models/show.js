const mongoose = require('mongoose');

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
  // You can expand this schema to include more fields like air dates, seasons, etc.
  // You can also add a field for artwork if you plan to store image URLs.
});

const Show = mongoose.model('Show', showSchema);

module.exports = Show;
