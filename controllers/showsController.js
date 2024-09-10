const express = require('express');
const axios = require('axios');
const Show = require('../models/show');
require('dotenv').config();
const User = require('../models/user');
const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const POPULAR_TV_SHOWS_URL = '/tv/popular?language=en-US&page=1';
const LATEST_TV_SHOWS_URL = '/trending/tv/day?language=en-US&page=1';
const SHOWS_BY_GENRE = '/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const HEADERS = {
  'Accept': 'application/json',
  'Authorization': `Bearer ${TMDB_API_KEY}`,
  'Host': 'api.themoviedb.org'
};

const fetchShowData = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/tv/${id}?language=en-US`, { headers: HEADERS });
  return response.data;
};

const saveShow = async (showData) => {
  const lastEpisodeToAir = showData.last_episode_to_air ? showData.last_episode_to_air : {};
  const nextEpisodeToAir = showData.next_episode_to_air ? showData.next_episode_to_air : {};
  let show = await Show.findOne({ id: showData.id });

  if (!show) {
    show = new Show({
      id: showData.id,
      name: showData.name,
      poster_path: showData.poster_path,
      last_episode_to_air: lastEpisodeToAir,
      next_episode_to_air: nextEpisodeToAir,
      number_of_episodes: showData.number_of_episodes ? Number(showData.number_of_episodes) : 0,
      number_of_seasons: showData.number_of_seasons ? Number(showData.number_of_seasons) : 0,
      seasons: showData.seasons,
      vote_average: showData.vote_average,
      vote_count: showData.vote_count,
      overview: showData.overview,
      tagline: showData.tagline,
      genres: showData.genres,
      in_production: showData.in_production,
      networks: showData.networks,
      status: showData.status,
      homepage: showData.homepage,
      last_air_date: (() => {
        try {
          return showData.last_air_date ? new Date(showData.last_air_date) : null;
        } catch (error) {
          console.error('Invalid date format for last_air_date:', showData.last_air_date);
          return null;
        }
      })(),
    });
    await show.save();
  }
  return show;
};

const addUserShow = async (userId, show, listName) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const isShowAlreadyInList = user[listName].some(item => item.id === show.id);

  if (!isShowAlreadyInList) {
    user[listName].push({
      id: show.id,
      name: show.name,
      poster_path: show.poster_path,
      last_episode_to_air: {
        id: show.last_episode_to_air.id,
        name: show.last_episode_to_air.name,
        air_date: show.last_episode_to_air.air_date
      },
      next_episode_to_air: {
        id: show.next_episode_to_air.id,
        name: show.next_episode_to_air.name,
        air_date: show.next_episode_to_air.air_date
      }
    });
    await user.save();
  }
  return user;
};
// Fetch multiple pages of results
const fetchMultiplePages = async (url, pages = 5) => {
  let results = [];
  for (let page = 1; page <= pages; page++) {
    const response = await axios.get(`${url}&page=${page}`, { headers: HEADERS });
    results = results.concat(response.data.results);
  }
  return results;
};

// Popular shows route
router.get('/pages/popular', async (req, res) => {
  const pagesToFetch = 5; 
  const url = `${API_BASE_URL}${POPULAR_TV_SHOWS_URL}`;

  try {
    const shows = await fetchMultiplePages(url, pagesToFetch);
    res.render('pages/popular', { shows });
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    res.status(500).send('Error fetching popular TV shows');
  }
});

// Fetch shows by genre
router.get('/pages/browse', async (req, res) => {
  try {
    const genreResponse = await axios.get(`${API_BASE_URL}/genre/tv/list?language=en`, { headers: HEADERS });
    const genres = genreResponse.data.genres;
    res.render('pages/browse', { genres });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching genres');
  }
});

// Render Shows by genre
router.get('/pages/genre/:genreId', async (req, res) => {
  const genreId = req.params.genreId;
  const url = `${API_BASE_URL}${SHOWS_BY_GENRE}${genreId}`;
  const pagesToFetch = 5; 

  try {
    const shows = await fetchMultiplePages(url, pagesToFetch);
    const userId = req.session.userId;

    // Fetch all genres
    const genresResponse = await axios.get(`${API_BASE_URL}/genre/tv/list`, { headers: HEADERS });
    const genre = genresResponse.data.genres.find(genre => genre.id.toString() === genreId);

    res.render('pages/genre', { genre: genre, shows: shows, userId });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching TV shows for the genre');
  }
});

// Fetch latest TV shows
router.get('/pages/latest', async (req, res) => {
  const { username, loggedIn, userId } = req.session;
  const url = `${API_BASE_URL}${LATEST_TV_SHOWS_URL}`;
  const pagesToFetch = 5; 

  try {
    const shows = await fetchMultiplePages(url, pagesToFetch);
    res.render('pages/latest', { shows: shows, username, loggedIn, userId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching latest TV shows');
  }
});

// Show details page
router.get('/pages/show/:id', async (req, res) => {
  const { username, loggedIn, userId } = req.session;
  const { id } = req.params;
  try {
    const show = await fetchShowData(id);
    res.render('pages/show', { show, username, loggedIn, userId });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching show details');
  }
});

// Search TV shows
router.get('/search-tv-shows', async (req, res) => {
  const query = req.query.q;
  try {
    const response = await axios.get(`${API_BASE_URL}/search/tv?query=${query}`, { headers: HEADERS });
    res.json(response.data.results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during search');
  }
});

// Fetch show details for modal
router.get('/partials/modal/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const show = await fetchShowData(id);
    res.render('partials/modal', { id, show });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching show details');
  }
});

// Update rating
router.post('/update-rating', async (req, res) => {
  const { userId, showId, rating } = req.body;

  try {
    const user = await User.findById(userId);

    // Update rating
    const showToUpdate = user.watched.find(show => show.id === showId);
    if (showToUpdate) {
      showToUpdate.user_rating = Number(rating);
      await user.save();
    }

    res.redirect('/users/hub');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while updating the rating.');
  }
});

// Add show to favorites
router.post('/shows/add/:userId', async (req, res) => {
  console.log('Received request body:', req.body);
  try {
    const showData = req.body;
    const userId = req.params.userId;

    const show = await saveShow(showData);
    const user = await addUserShow(userId, show, 'favorites');

    res.json({ message: 'Show added to favorites', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred', error: err.toString() });
  }
});

// Add show to watched list
router.post('/shows/watched/add/:userId', async (req, res) => {
  console.log('Received request body:', req.body);

  try {
    const showData = req.body;
    const userId = req.params.userId;

    const show = await saveShow(showData);
    const user = await addUserShow(userId, show, 'watched');

    res.redirect('/users/hub');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred', error: err.toString() });
  }
});

// Add show to watchlist
router.post('/shows/watchlist/add/:userId', async (req, res) => {
  console.log('Received request body:', req.body);

  try {
    const showData = req.body;
    const userId = req.params.userId;

    const show = await saveShow(showData);
    const user = await addUserShow(userId, show, 'watchlist');

    res.redirect('/users/hub');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred', error: err.toString() });
  }
});

//get show details

router.get('/shows/:showId', async (req, res) => {
  try {
    const showId = req.params.showId;
    const show = await Show.findOne({ id: showId });

    if (!show) {
      return res.status(404).send('Show not found');
    }

    res.render('users/hub', { show });
  } catch (error) {
    console.error('Error fetching show:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Fetch recommendations
router.get('/get-recommendations/:showId', async (req, res) => {
  const showId = req.params.showId;
  const url = `${API_BASE_URL}/tv/${showId}/recommendations?language=en-US&page=1`;

  try {
    const apiResponse = await axios.get(url, { headers: HEADERS });
    const jsonResponse = apiResponse.data;
    res.json(jsonResponse.results.slice(0, 3)); 
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).send('Error fetching recommendations');
  }
});
// Search page route
router.get('/pages/search', (req, res) => {
  res.render('pages/search', { userId: req.session.userId });
});

// Browse genres route
router.get('/pages/browse', (req, res) => {
  res.render('pages/browse', { genres: req.genres });
});

// Genre page route
router.get('/pages/genre', (req, res) => {
  res.render('pages/genre', { genres: req.genres });
});

console.info('showsController is connected');
module.exports = router;