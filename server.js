const path = require('path');
require('dotenv').config();
const express = require('express');
const middleware = require('./utils/middleware');
const mongoose = require('./utils/connection');
const axios = require('axios');
const TMDB_API_KEY = process.env.APIKEY;
const apiKey = process.env.TVDB_API_KEY;




const UserRouter = require('./controllers/userController')
const ShowRouter = require('./controllers/showsController')


const app = express();

app.use(express.urlencoded({ extended: true }));



// EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for static files
middleware(app)



app.get('/', (req, res) => {
    const { username, loggedIn, userId } = req.session
    // res.send('the app is connected')
    res.render('pages/home', { username, loggedIn, userId })
})

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

// Route to render the 'browse' view
app.get('/pages/browse', (req, res) => {
  res.render('pages/browse', { genres: req.genres }); // Use the genres from the req object
});

// Route to render the 'genre' view
app.get('/pages/genre', (req, res) => {
  res.render('pages/genre', { genres: req.genres }); // Use the genres from the req object
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






app.use('/users', UserRouter);
app.use('/shows', ShowRouter);




// Error page
app.get('/error', (req, res) => {
  const error = req.query.error || 'Something went wrong...try again';
  const { username, loggedIn, userId } = req.session;
  res.render('error', { error, userId, username, loggedIn }); // Assuming 'error.ejs' is in the 'views' directory
});



// Listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



