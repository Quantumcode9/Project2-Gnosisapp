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


app.get('/pages/browse', (req, res) => {
  axios.get('https://api.themoviedb.org/3/genre/tv/list?language=en', {
    headers: {
      'Authorization': `Bearer ${TMDB_API_KEY}`,
      'Accept': 'application/json'
    }
  })
  .then(response => {
    // Pass the genres to the EJS template
    res.render('pages/browse', { genres: response.data.genres });
  })
  .catch(error => {
    console.error(error); // Log the error
    res.status(500).send('Error fetching genres');
  });
});

//////////////////////////////
app.get('/pages/genre/:genreId', async (req, res) => {
  const genreId = req.params.genreId;

  try {
    // Fetch TV shows from TMDb API based on the genreId
    // This is an example URL, you'll need to use the correct API endpoint and parameters
    const response = await axios.get(`https://api.themoviedb.org/3/discover/tv?with_genres=${genreId}&api_key=${TMDB_API_KEY}`);

    // Render a template with the fetched TV shows
    res.render('pages/genre', { shows: response.data.results });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching TV shows for the genre');
  }
});


// app.get('/pages/browse', (req, res) => {
//     const { username, loggedIn, userId } = req.session



//     res.render('pages/browse', {genres, selectedGenre}); // Render the EJS template with the data
// })




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



