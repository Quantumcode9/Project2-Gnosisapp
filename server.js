const path = require('path');
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const UserRouter = require('./controllers/userController');
const ShowRouter = require('./controllers/showsController');
const middleware = require('./utils/middleware');
const mongoose = require('./utils/connection');
const showsController = require('./controllers/showsController');
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

// Fetch genres
app.use(async (req, res, next) => {
  const url = `${API_BASE_URL}/genre/tv/list?language=en-US`;
  try {
    const response = await axios.get(url, { headers: HEADERS });
    req.genres = response.data.genres;
    next();
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).send('Error fetching genres');
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