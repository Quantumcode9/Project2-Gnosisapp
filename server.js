const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('./utils/connection');
const axios = require('axios');
const TMDB_API_KEY = process.env.APIKEY;
const API_KEY = process.env.TMDB_API_KEY;
const UserRouter = require('./controllers/userController');
const ShowRouter = require('./controllers/showsController');
const { addShowToFavorites } = require('./services/showService');
const User = require('./models/user');
const middleware = require('./utils/middleware');
const router = require('./controllers/userController');



const app = express();



// Static files
app.use(express.static('node_modules/bootstrap/dist'));
app.use(express.static(path.join(__dirname, 'public')));

// EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// Middleware 
middleware(app)


// Home route
app.get('/', (req, res) => {
  const { username, loggedIn, userId } = req.session;
  res.render('pages/home', { username, loggedIn, userId });
});


//////////////////////////////
//ADD TO CONTROLLER FILE//
/////////////////////////////
// Middleware to fetch genres
app.use(async (req, res, next) => {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/genre/tv/list?language=en', {
      headers: {
        'Authorization': `Bearer ${TMDB_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    req.genres = response.data.genres; // Attach genres to the req object
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching genres');
  }
});


// add to favorites

app.post('/add-to-favorites', async (req, res) => {
  console.log(req.body);
  
  const userId = req.session.userId;
  const { id, name, poster_path } = req.body; // Adjusted to match the client-side

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const isAlreadyFavorite = user.favorites.some(favorite => favorite.showId === id);
    if (!isAlreadyFavorite) {
      user.favorites.push({ showId: id, title: name, posterPath: poster_path });
      await user.save();
      res.json({ message: 'Show added to favorites' });
    } else {
      res.json({ message: 'Show is already in favorites' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error processing request');
  }
});





// Routes
app.use('/users', UserRouter);
app.use('/shows', ShowRouter);


// Genre routes
app.get('/pages/browse', (req, res) => {
  res.render('pages/browse', { genres: req.genres });
});

app.get('/pages/genre', (req, res) => {
  res.render('pages/genre', { genres: req.genres });
});

//////////////////////////////
app.get('/pages/genre/:genreId', async (req, res) => {
  const genreId = req.params.genreId; // Get the genre ID from the URL parameter

  const url = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${genreId}`;
  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TMDB_API_KEY}`,
      'Accept': 'application/json'
    }
  };

  try {
    const response = await axios(url, options);
    // Render a template with the fetched TV shows
    res.render('pages/genre', { shows: response.data.results, });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching TV shows for the genre');
  }
});

//////////////////////////////



// Fetch recommendations

app.get('/get-recommendations/:showId', async (req, res) => {
  const showId = req.params.showId;
  const url = `https://api.themoviedb.org/3/tv/${showId}/recommendations?language=en-US&page=1`;

  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TMDB_API_KEY}`,
      'Accept': 'application/json'
    }
  };

  try {
    const apiResponse = await fetch(url, options);
    const jsonResponse = await apiResponse.json();
    res.json(jsonResponse.results.slice(0, 3)); // Send top 3 recommendations
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).send('Error fetching recommendations');
  }
});

// Submit rating
app.post('/add-rated-show', async (req, res) => {
  const { showId, rating } = req.body;
  const userId = req.session.userId;

  try {
    const user = await User.findById(userId);
    if (user) {
      // Add logic to update user's schema with the rated show
      res.json({ message: 'Show rating added' });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
});

async function fetchShows(endpoint) {
  const response = await axios.get(`https://api.themoviedb.org/3/tv/${endpoint}?api_key=${API_KEY}&language=en-US`);
  return response.data.results.slice(0, 8); // Limit to 8 shows
}

app.get('/', async (req, res) => {
  try {
      const popularShows = await fetchShows('popular');
      console.log(popularShows); // Log the value of popularShows
      res.render('home', { popularShows }); // Pass popularShows to the view
  } catch (err) {
      console.error(err);
      res.status(500).send('An error occurred while trying to fetch shows');
  }
});





//Favorites Page


// server.js



/////////////////////////////////////////


// Error page
app.get('/error', (req, res) => {
  const error = req.query.error || 'Something went wrong...try again';
  const { username, loggedIn, userId } = req.session;
  res.render('error', { error, userId, username, loggedIn }); // Assuming 'error.ejs' is in the 'views' directory
});



// Listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


module.exports = app;
