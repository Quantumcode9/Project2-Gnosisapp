const express = require('express');
const axios = require('axios');
const Show = require('../models/show');
require('dotenv').config();
const User = require('../models/user');
const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';
const HEADERS = {
  'Accept': 'application/json',
  'Authorization': `Bearer ${TMDB_API_KEY}`,
  'Host': 'api.themoviedb.org'
};

// Common API endpoints
const API_ENDPOINTS = {
  POPULAR: '/discover/tv?language=en-US&sort_by=popularity.desc&with_original_language=en',
  LATEST: '/trending/tv/week?language=en-US',
  GENRE_DISCOVER: '/discover/tv?language=en-US&with_original_language=en&sort_by=popularity.desc&with_genres=',
  GENRE_LIST: '/genre/tv/list?language=en-US',
  SHOW_DETAIL: (id) => `/tv/${id}?language=en-US`,
  RECOMMENDATIONS: (id) => `/tv/${id}/recommendations?language=en-US&region=US`,
  SEARCH: (query) => `/search/tv?query=${encodeURIComponent(query)}`
};

// Fetch show data from API
const fetchShowData = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.SHOW_DETAIL(id)}`, { headers: HEADERS });
    return response.data;
  } catch (error) {
    console.error(`Error fetching show data for ID ${id}:`, error);
    throw new Error('Failed to fetch show data');
  }
};

// Save show to database
const saveShow = async (showData) => {
  try {
    let show = await Show.findOne({ id: showData.id });

    if (!show) {
      // If show doesn't exist in DB, fetch complete details
      const fullShowData = showData.name ? showData : await fetchShowData(showData.id);
      
      
      show = new Show({
        id: fullShowData.id,
        name: fullShowData.name,
        poster_path: fullShowData.poster_path,
        last_episode_to_air: fullShowData.last_episode_to_air,
        next_episode_to_air: fullShowData.next_episode_to_air,
        number_of_episodes: fullShowData.number_of_episodes ? Number(fullShowData.number_of_episodes) : 0,
        number_of_seasons: fullShowData.number_of_seasons ? Number(fullShowData.number_of_seasons) : 0,
        seasons: fullShowData.seasons || [],
        vote_average: fullShowData.vote_average || 0,
        vote_count: fullShowData.vote_count || 0,
        overview: fullShowData.overview || '',
        tagline: fullShowData.tagline || '',
        in_production: fullShowData.in_production || false,
        networks: fullShowData.networks || [],
        status: fullShowData.status || '',
        homepage: fullShowData.homepage || '',
        last_air_date: fullShowData.last_air_date || null
      });
      await show.save();
    }
    return show;
  } catch (error) {
    console.error('Error saving show:', error);
    throw error;
  }
};

// Fetch multiple pages of results
const fetchMultiplePages = async (url, pages = 5) => {
  try {
    let results = [];
    for (let page = 1; page <= pages; page++) {
      const pageUrl = url.includes('?') 
        ? `${url}&page=${page}` 
        : `${url}?page=${page}`;
      const response = await axios.get(pageUrl, { headers: HEADERS });
      results = results.concat(response.data.results);
    }
    return results;
  } catch (error) {
    console.error('Error fetching multiple pages:', error);
    throw error;
  }
};

// Render page with shows
const renderShowsPage = async (req, res, url, template, title, pagesToFetch = 5) => {
  const { username, loggedIn, userId } = req.session;
  
  try {
    const shows = await fetchMultiplePages(url, pagesToFetch);
    res.render(template, { 
      shows,
      title,
      username, 
      loggedIn, 
      userId 
    });
  } catch (error) {
    console.error(`Error fetching shows for ${template}:`, error);
    res.status(500).send(`Error fetching ${title}`);
  }
};

// Popular shows route
router.get('/pages/popular', (req, res) => {
  const url = `${API_BASE_URL}${API_ENDPOINTS.POPULAR}`;
  renderShowsPage(req, res, url, 'pages/popular', 'Popular TV Shows');
});

// Latest shows route
router.get('/pages/latest', (req, res) => {
  const url = `${API_BASE_URL}${API_ENDPOINTS.LATEST}`;
  renderShowsPage(req, res, url, 'pages/latest', 'Latest TV Shows');
});

// Fetch shows by genre
router.get('/pages/browse', async (req, res) => {
  try {
    const genreResponse = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GENRE_LIST}`, { headers: HEADERS });
    const genres = genreResponse.data.genres;
    res.render('pages/browse', { genres, userId: req.session.userId });
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).send('Error fetching genres');
  }
});

// Render Shows by genre
router.get('/pages/genre/:genreId', async (req, res) => {
  const genreId = req.params.genreId;
  const url = `${API_BASE_URL}${API_ENDPOINTS.GENRE_DISCOVER}${genreId}`;
  
  try {
    const shows = await fetchMultiplePages(url, 5);
    const userId = req.session.userId;

    // Fetch all genres
    const genresResponse = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GENRE_LIST}`, { headers: HEADERS });
    const genre = genresResponse.data.genres.find(genre => genre.id.toString() === genreId);

    res.render('pages/genre', { genre, shows, userId });
  } catch (error) {
    console.error('Error fetching TV shows for genre:', error);
    res.status(500).send('Error fetching TV shows for the genre');
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
    console.error('Error fetching show details:', error);
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
  try {
    const { showId } = req.params;
    const url = `${API_BASE_URL}${API_ENDPOINTS.RECOMMENDATIONS(showId)}`;
    const response = await axios.get(url, { headers: HEADERS });
    
    // Ensure we're returning a valid array of recommendations
    const recommendations = response.data.results || [];
    
    // Limit to 5 recommendations with valid poster paths
    const validRecommendations = recommendations
      .filter(show => show.poster_path)
      .slice(0, 5);
    
    res.json(validRecommendations || []);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
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



router.post('/shows/favorites/add', async (req, res) => {
  try {
    const { userId, id } = req.body;
    const show = await saveShow({ id });
    await addUserShow(userId, show, 'favorites');
    res.json({ message: 'Show added', success: true });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    handleAddError(res, error);
  }
});

router.post('/shows/watched/add', async (req, res) => {
  try {
    const { userId, id, user_rating } = req.body;
    const show = await saveShow({ id });
    const additionalData = { user_rating };
    await addUserShow(userId, show, 'watched', additionalData);
    res.json({ message: 'Show added', success: true });
  } catch (error) {
    console.error('Error adding to watched:', error);
    handleAddError(res, error);
  }
});

router.post('/shows/watchlist/add', async (req, res) => {
  try {
    const { userId, id } = req.body;
    const show = await saveShow({ id });
    await addUserShow(userId, show, 'watchlist');
    res.json({ message: 'Show added', success: true });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    handleAddError(res, error);
  }
});

// Helper function for error handling
function handleAddError(res, error) {
  if (error.message === 'Show already in list') {
    res.status(400).json({ message: 'Show is already in your list.' });
  } else {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
}


// Add show to user's favorites
router.post('/shows/favorites/add/:userId', async (req, res) => {
  try {
    console.log('Adding to favorites:', req.body, 'for user:', req.params.userId);
    const userId = req.params.userId;
    const { id, name, poster_path } = req.body;
    
    // Validate input
    if (!userId || !id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Save show to database
    const show = await saveShow({ id, name, poster_path });
    
    // Add to user's favorites
    const result = await User.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { favorites: show.id } }
    );
    
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Added to favorites', success: true });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Error adding show', error: error.message });
  }
});

// Add show to user's watched list

router.post('/shows/watched/add/:userId', async (req, res) => {
  console.log('Received request body:', req.body);

  try {
    const { id, user_rating } = req.body; // Extract only needed data
    const userId = req.params.userId;

    // Fetch show details and save if not already in the database
    const show = await saveShow({ id });

    // Prepare additional data if any
    const additionalData = {};
    if (user_rating) {
      additionalData.user_rating = user_rating;
    }

    // Add show to user's list
    const user = await addUserShow(userId, show, 'watched', additionalData);

    res.redirect('/users/hub'); // Redirect to user hub or send a response
  } catch (err) {
    console.error(err);
    if (err.message === 'Show already in list') {
      res.status(400).json({ message: 'Show is already in your list.' });
    } else {
      res.status(500).json({ message: 'An error occurred', error: err.toString() });
    }
  }
}
);


// Add show to user's watchlist

router.post('/shows/watchlist/add/:userId', async (req, res) => {
  console.log('Received request body:', req.body);

  try {
    const { id } = req.body; // Extract only needed data
    const userId = req.params.userId;

    // Fetch show details and save if not already in the database
    const show = await saveShow({ id });

    // Add to user's favorites
    const result = await User.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { watchlist: show.id } }
    );
    
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Added to watchlist', success: true });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Error adding show', error: error.message });
  }
});





// Add show to user's list



router.post('/shows/:listName/add/:userId', async (req, res) => {
  console.log('Received request body:', req.body);

  try {
    const { id, user_rating } = req.body; // Extract only needed data
    const userId = req.params.userId;
    const listName = req.params.listName;

    const validLists = ['favorites', 'watched', 'watchlist'];
    if (!validLists.includes(listName)) {
      return res.status(400).json({ message: 'Invalid list name' });
    }

    // Fetch show details and save if not already in the database
    const show = await saveShow({ id });

    // Prepare additional data if any
    const additionalData = {};
    if (user_rating) {
      additionalData.user_rating = user_rating;
    }

    // Add show to user's list
    const user = await addUserShow(userId, show, listName, additionalData);

    res.redirect('/users/hub'); // Redirect to user hub or send a response
  } catch (err) {
    console.error(err);
    if (err.message === 'Show already in list') {
      res.status(400).json({ message: 'Show is already in your list.' });
    } else {
      res.status(500).json({ message: 'An error occurred', error: err.toString() });
    }
  }
});

// Refactored addUserShow function
const addUserShow = async (userId, show, listName, additionalData = {}) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (!user[listName]) {
    user[listName] = [];
  }

  const showId = Number(show.id); // Ensure it's a number

  if (listName === 'watched') {
    // For watched list, check if show is already in list
    const isShowAlreadyInList = user.watched.some(item => item.showId === showId);

    if (isShowAlreadyInList) {
      throw new Error('Show already in list');
    }

    // Add showId and user_rating to watched list
    user.watched.push({
      showId: showId,
      user_rating: additionalData.user_rating || null
    });
  } else {
    // For other lists (favorites, watchlist)
    if (user[listName].includes(showId)) {
      throw new Error('Show already in list');
    }
    user[listName].push(showId);
  }

  await user.save();
  return user;
};




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



console.info('showsController is connected');
module.exports = router;