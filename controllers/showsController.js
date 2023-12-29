const express = require('express');
const axios = require('axios');
const Show = require('../models/show');
require('dotenv').config();

const router = express.Router();
const apiKey = process.env.TVDB_API_KEY; 



const TVDBService = require('../utils/TVDBService');

// Example: Fetch shows by genre
async function fetchShowsByGenre(genre) {
  try {
    const shows = await TVDBService.searchShows({ genre });
    console.log(shows);
    // Process and use the shows data as needed
  } catch (error) {
    console.error('Failed to fetch shows:', error);
  }
}


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

router.get('/series/:id', async (req, res) => {
    console.log("Series ID:", req.params.id); // Check the received series ID
    try {
        const seriesData = await fetchSeriesData(req.params.id);
        console.log("Series Data:", seriesData); // Check the API response
        res.render('series/seriesDetail', { series: seriesData });
    } catch (error) {
        console.error('Error fetching series:', error);
        res.status(500).send('Error fetching series');
    }
});


router.get('/pages/browse', async (req, res) => {
    // Fetch or define your data
    const genres = ['Action', 'Adventure', 'Animation', 'Children', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Food', 'Home and Garden', 'Horror', 'Mini-Series', 'Mystery', 'News', 'Reality', 'Romance', 'Sci-Fi', 'Sport', 'Suspense', 'Talk Show', 'Thriller', 'Travel'];
    const data = await TVDBService.searchShows({ genre: genres });
    const selectedGenre = req.query.genre;

    res.render('/pages/browse', {genres, selectedGenre: data }); // Render the EJS template with the data
});



module.exports = router;












// const showsController = {
//   list: async (req, res) => {
//     try {
//       const shows = await Show.find(); // Fetch all shows from your database
//       res.render('pages/shows', { shows: shows });
//     } catch (error) {
//       res.status(500).send(error);
//     }
//   },
//   detail: async (req, res) => {
//     try {
//       const show = await Show.findById(req.params.id); // Fetch a single show by ID
//       res.render('pages/showDetail', { show: show });
//     } catch (error) {
//       res.status(500).send(error);
//     }
//   }
//   // Add more methods as needed
// };

