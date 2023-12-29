const path = require('path');
require('dotenv').config();
const express = require('express');
const middleware = require('./utils/middleware');
const mongoose = require('./utils/connection');



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

app.use('/users', UserRouter);
app.use('/shows', ShowRouter);


// app.get('/shows/:genre', async (req, res) => {
//   try {
//     const genre = req.params.genre;
//     const shows = await showsController.fetchShowsByGenre(genre);
//     res.json(shows);
//   } catch (error) {
//     res.status(500).send('Error fetching shows');
//   }
// });

app.get('/shows/:genre', async (req, res) => {
  const genre = req.params.genre;

  if (!genres.includes(genre)) {
      return res.status(400).send('Invalid genre');
  }

  try {
      // Replace this URL with the actual TVDB API endpoint for fetching shows by genre
      const response = await axios.get(`https://api.thetvdb.com/shows?genre=${genre}`);
      res.json(response.data);
  } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).send('Failed to fetch shows');
  }
});





// Error page
app.get('/error', (req, res) => {
  const error = req.query.error || 'Something went wrong...try again';
  const { username, loggedIn, userId } = req.session;
  res.render('error', { error, userId, username, loggedIn }); // Assuming 'error.ejs' is in the 'views' directory
});



// Listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



