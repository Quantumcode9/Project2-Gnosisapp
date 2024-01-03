const express = require('express');
const axios = require('axios');
const Show = require('../models/show');
require('dotenv').config();
const client = require('../utils/connection');

const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;




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




async function storeTvShows() {
  try {
      await client.connect();
      const db = client.db('TVDB');
      const collection = db.collection('shows');

      const tvShows = await fetchPopularTvShows();

      const formattedShows = tvShows.map(show => ({
          tmdbId: show.id,
          title: show.name,
          imageUrl: `https://image.tmdb.org/t/p/w500${show.poster_path}`
      }));

      await collection.insertMany(formattedShows);
      console.log('TV shows stored in MongoDB');
  } catch (error) {
      console.error('Error storing TV shows:', error);
  } finally {
      await client.close();
  }
}



router.get('/home', async (req, res) => {
  try {
      await client.connect();
      const db = client.db('TVDB');
      const collection = db.collection('shows');

      const tvShows = await collection.find({}).toArray();
      res.render('home', { tvShows }); 
  } catch (error) {
      console.error('Error fetching TV shows:', error);
      res.status(500).send('Error fetching TV shows');
  } finally {
      await client.close();
  }
});
console.log('showController is connected')
module.exports = router;


router.post('/add-tv-show', async (req, res) => {
  try {
      await client.connect();
      const db = client.db('TVDB');
      const collection = db.collection('shows');
      const { title, imageUrl } = req.body;

      await collection.insertOne({ title, imageUrl });
      res.redirect('/tv-shows');
  } catch (error) {
      console.error('Error adding TV show:', error);
      res.status(500).send('Error adding TV show');
  } finally {
      await client.close();
  }
});





// // Fetch popular TV shows
// router.get('/popular-shows', async (req, res) => {
//   try {
//     const response = await axios.get(`https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}`);
//     res.render('popularShows', { shows: response.data.results });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error fetching popular TV shows');
//   }
// })

// console.log('showController is connected')
// module.exports = router;







// // Fetch genres
// router.get('/genres', async (req, res) => {
//   try {
//     const response = await axios.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}`);
//     res.render('genres', { genres: response.data.genres });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error fetching genres');




