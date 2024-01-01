const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('./utils/connection');
const axios = require('axios');
const TMDB_API_KEY = process.env.APIKEY;

const UserRouter = require('./controllers/userController');
const ShowRouter = require('./controllers/showsController');
const { addShowToFavorites } = require('./services/showService');
const User = require('./models/user');
const middleware = require('./utils/middleware');

const app = express();

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const Show = require('./models/show');

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


//add to favorites
// const { addShowToFavorites } = require('./services/showService');

// app.post('/add-to-favorites', async (req, res) => {
//   const { showId } = req.body;
//   const userId = req.session.userId; 

//   try {
//     const user = await User.findById(userId);

//     if (user) {
//       // Add showId to the user's favorites, avoiding duplicates
//       if (!user.favorites.includes(showId)) {
//         user.favorites.push(showId);
//         await user.save();
//         res.json({ message: 'Show added to favorites' });
//       } else {
//         // Handle the case where the show is already in the favorites
//         res.json({ message: 'Show is already in favorites' });
//       }
//     } else {
//       res.status(404).send('User not found');
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error processing request');
//   }
// });

// Add to favorites
app.post('/add-to-favorites', async (req, res) => {
  const { showId } = req.body;
  const userId = req.session.userId; 

  try {
    const result = await addShowToFavorites(userId, showId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
});

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


//Favorites Page

app.get('/users/favorites', async (req, res) => {
 try {
const userId = req.session.userId; // Or however you store the logged-in user's ID
       const user = await User.findById(userId).populate('favorites'); 
     
      console.log(user.favorites); // Log to check the data

     if (!user) {
          return res.status(404).send('User not found');
      }
       res.render('users/favorites', { favorites: user.favorites }); // Render the EJS template with favorites data
   } catch (error) {
      console.error(error);
       res.status(500).send('Error retrieving favorites');
   }
   });



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
