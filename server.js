const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('./utils/connection');
const axios = require('axios');
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const UserRouter = require('./controllers/userController');
const ShowRouter = require('./controllers/showsController');
const { addShowToFavorites } = require('./services/showService');
const User = require('./models/user');
const middleware = require('./utils/middleware');
const showsController = require('./controllers/showsController');

const API_BASE_URL = 'https://api.themoviedb.org/3';
const POPULAR_TV_SHOWS_URL = '/tv/popular?language=en-US&page=1';
const HEADERS = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${TMDB_API_KEY}`,
    'Host': 'api.themoviedb.org'
};


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

// add to favorites///////////////////////////

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json'
  }
};

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

      // Send the data to the server using axios
      const response = await axios.post('/api/add-to-favorites', { id, name, poster_path }, axiosConfig);

      res.json({ message: response.data.message });
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

  const url = `${API_BASE_URL}/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${genreId}`;

  try {
    const response = await axios.get(url, { headers: HEADERS });
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
  const url = `${API_BASE_URL}/tv/${showId}/recommendations?language=en-US&page=1`;

  try {
    const apiResponse = await axios.get(url, { headers: HEADERS });
    const jsonResponse = apiResponse.data;
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
app.get('/pages/popular', async (req, res) => {
  const { username, loggedIn, userId } = req.session;
  const url = `${API_BASE_URL}${POPULAR_TV_SHOWS_URL}`;

  try {
    const response = await axios.get(url, { headers: HEADERS });
    // Render your EJS view here, passing the TV shows data
    res.render('pages/popular', { shows: response.data.results });
  } catch (error) {
    console.error('error:', error);
    res.status(500).send('Error fetching TV shows');
  }
});

app.use('/', showsController);


app.get('/home', async (req, res) => {
  const url = `${API_BASE_URL}${POPULAR_TV_SHOWS_URL}`;

  try {
    const response = await axios.get(url, { headers: HEADERS });
    res.render('home', { shows: response.data.results }); // Render home.ejs with tvShows data
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    res.status(500).send('Error fetching TV shows');
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
