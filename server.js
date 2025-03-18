const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('./utils/connection');
const axios = require('axios');
const UserRouter = require('./controllers/userController');
const ShowRouter = require('./controllers/showsController');
const middleware = require('./utils/middleware');
const deleteController = require('./controllers/delete');
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';
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


const genresCache = {
  data: null,
  lastFetched: null,
  maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

// Middleware to fetch and cache genres
app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api/')) {
    // Check if we have cached genres that aren't too old
    const now = Date.now();
    if (!genresCache.data || !genresCache.lastFetched || (now - genresCache.lastFetched > genresCache.maxAge)) {
      try {
        const url = `${API_BASE_URL}/genre/tv/list?language=en-US`;
        const response = await axios.get(url, { headers: HEADERS });
        genresCache.data = response.data.genres;
        genresCache.lastFetched = now;
        console.log('Genres fetched and cached at', new Date(now).toLocaleString());
      } catch (error) {
        console.error('Error fetching genres:', error);
        genresCache.data = genresCache.data || []; 
      }
    }
    
    res.locals.genres = genresCache.data;
    req.genres = genresCache.data;
  }
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// EJS view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/users', UserRouter);
app.use('/', ShowRouter); // Mount ShowRouter at root path instead of /shows
app.use('/delete', deleteController);

// Home route
app.get('/', (req, res) => {
  res.render('pages/home');
});

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