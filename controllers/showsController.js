const express = require('express');
const axios = require('axios');
const Show = require('../models/show');
require('dotenv').config();
const client = require('../utils/connection');

const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const LATEST_TV_SHOWS_URL = '/trending/tv/day?language=en-US&page=1';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const POPULAR_TV_SHOWS_URL = '/tv/popular?language=en-US&page=1';
const HEADERS = {
    'Accept': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNzI0MmRmZmQ1ZTA3ZmFkNzFmYjc1MWFjZjY2MjY1MiIsInN1YiI6IjY1OGYwZjQ0MGQyZjUzNWNjZWQzZDRmOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.J-Rmx8CA0fnwbMwHLG5pTqTxjKE-1abuG1by44-kN1s',
    // 'Authorization': `Bearer ${TMDB_API_KEY}`,
    'Host': 'api.themoviedb.org'
};





// Fetch shows by genre

 router.get('/pages/browse', async (req, res) => {
   try {
     const genreResponse = await axios.get(`${API_BASE_URL}/genre/tv/list?language=en`, { headers: HEADERS });
    console.log(genreResponse.data); // Log the response data

    const genres = genreResponse.data.genres; // Extract genres from the response
     console.log(genres);
     res.render('pages/browse', { genres }); // Pass genres to the EJS template
   } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching genres');
   }
 });




//Fetch latest TV shows


router.get('/pages/latest', (req, res) => {
const { username, loggedIn, userId } = req.session;
axios(`${API_BASE_URL}${LATEST_TV_SHOWS_URL}`, { headers: HEADERS })
  .then(apiRes => {
// console.log('this came back from the api: \n', apiRes.data)
// 
res.render('pages/latest', { shows: apiRes.data.results, username, loggedIn, userId });
})


.catch(err => {
 console.log(err)
  res.send('error')
}
 )
 })




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


console.log('showController is connected')
module.exports = router;









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








// // Fetch genres
// router.get('/genres', async (req, res) => {
//   try {
//     const response = await axios.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}`);
//     res.render('genres', { genres: response.data.genres });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error fetching genres');




