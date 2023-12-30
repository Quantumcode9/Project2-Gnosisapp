const express = require('express');
const axios = require('axios');
const Show = require('../models/show');
require('dotenv').config();
const fetch = require('node-fetch');


const router = express.Router();
const TMDB_API_KEY = process.env.APIKEY;




// Fetch shows by genre
router.get('/pages/browse', async (req, res) => {
  try {
    const genreResponse = await axios.get('https://api.themoviedb.org/3/genre/tv/list?language=en', {
      headers: {
        'Authorization': `Bearer ${TMDB_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    console.log(genreResponse.data); // Log the response data

    const genres = genreResponse.data.genres; // Extract genres from the response
    console.log(genres);
    res.render('pages/browse', { genres }); // Pass genres to the EJS template
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching genres');
  }
});

// Fetch shows by genre







// Fetch popular TV shows
router.get('/popular-shows', async (req, res) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}`);
    res.render('popularShows', { shows: response.data.results });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching popular TV shows');
  }
});


// // Fetch genres
// router.get('/genres', async (req, res) => {
//   try {
//     const response = await axios.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}`);
//     res.render('genres', { genres: response.data.genres });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error fetching genres');
//   }
// });



module.exports = router;



