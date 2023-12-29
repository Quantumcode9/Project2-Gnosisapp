const express = require('express');
const axios = require('axios');
const Show = require('../models/show');
require('dotenv').config();


const router = express.Router();
const apiKey = process.env.TVDB_API_KEY; 
const TMDB_API_KEY = process.env.APIKEY;






// const fetchSeriesData = async (seriesId) => {
//     try {
//         const response = await axios.get(`https://thetvdb.github.io/v4-api/#/Series/getSeriesExtended`, {
//             headers: {
//                 'Authorization': `Bearer ${apiKey}`,
//                 'Accept': 'application/json'
//             }
//         });
//         return response.data; // The series data
//     } catch (error) {
//         console.error('Error fetching series data:', error);
//         throw error;
//     }
// };

// router.get('/series/:id', async (req, res) => {
//     try {
//         const seriesData = await fetchSeriesData(req.params.id);
//         res.render('seriesDetail', { series: seriesData });
//     } catch (error) {
//         res.status(500).send('Error fetching series');
//     }
// });

router.get('/pages/browse', async (req, res) => {
  console.log('Browse route hit');
});

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
////////////////
router.get('/pages/browse', async (req, res) => {
  console.log('Browse route hit');
  res.send('Browse page'); // Send a response back
});



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

// Fetch genres
router.get('/genres', async (req, res) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}`);
    res.render('genres', { genres: response.data.genres });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching genres');
  }
});




module.exports = router;



