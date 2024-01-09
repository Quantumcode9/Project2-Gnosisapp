const path = require('path');
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const UserRouter = require('./controllers/userController');
const ShowRouter = require('./controllers/showsController');
const middleware = require('./utils/middleware');
const mongoose = require('./utils/connection');
const showsController = require('./controllers/showsController')
const deleteController = require('./controllers/delete')
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';
const POPULAR_TV_SHOWS_URL = '/tv/popular?language=en-US&page=1';
const HEADERS = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${TMDB_API_KEY}`
};

const app = express();

// Middleware setup
middleware(app);

// Session data in views
app.use((req, res, next) => {
  res.locals.username = req.session.username;
  res.locals.loggedIn = req.session.loggedIn;
  res.locals.userId = req.session.userId;
  next();
});

// Fetch genres middleware
app.use(async (req, res, next) => {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/genre/tv/list?language=en', {
      headers: {
        'Authorization': `Bearer ${TMDB_API_KEY}`,
      },
    });
    
    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/users', UserRouter);
app.use('/shows', ShowRouter);
app.use('/', showsController);
app.use('/', deleteController);

// Home route
app.get('/', (req, res) => {
  res.render('pages/home');
});

app.get('/pages/search', (req, res) => {
  res.render('pages/search', { userId: req.session.userId });
});



// Genre routes
app.get('/pages/browse', (req, res) => {
  res.render('pages/browse', { genres: req.genres });
});

app.get('/pages/genre', (req, res) => {
  res.render('pages/genre', { genres: req.genres });
});

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////


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


// // Submit rating

app.get('/home', async (req, res) => {
  const url = `${API_BASE_URL}${POPULAR_TV_SHOWS_URL}`;

  try {
    const response = await axios.get(url, { headers: HEADERS });
    res.render('home', { shows: response.data.results }); 
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    res.status(500).send('Error fetching TV shows');
  }
});

// server.js

/////////////////////////////////////////

// Error page
app.get('/error', (req, res) => {
  const error = req.query.error || 'Something went wrong...try again';
  const { username, loggedIn, userId } = req.session;
  res.render('error', { error, userId, username, loggedIn }); 
});


// Listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


module.exports = app;
