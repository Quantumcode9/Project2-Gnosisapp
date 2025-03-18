const express = require('express');
const User = require('../models/user');
const Show = require('../models/show');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const axios = require('axios');
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';
const HEADERS = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${TMDB_API_KEY}`,
    'Host': 'api.themoviedb.org'
};
const router = express.Router();

const fetchUser = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).send('User not found');
            return;
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Error processing request');
    }
};

const renderWithSession = (view) => (req, res) => {
    const { username, loggedIn, userId } = req.session;
    res.render(view, { username, loggedIn, userId });
};

router.get('/signup', renderWithSession('users/signup'));

// POST -> SignUp - /users/signup
router.post('/signup', async (req, res) => {
    try {
        const newUser = req.body;
        newUser.password = await bcrypt.hash(newUser.password, await bcrypt.genSalt(10));
        await User.create(newUser);
        res.redirect('/users/login');
    } catch (err) {
        console.error('Error during signup:', err);
        res.redirect(`/error?error=${err}`);
    }
});

// GET -> Login - /users/login
router.get('/login', renderWithSession('users/login'));

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.username = username;
            req.session.loggedIn = true;
            req.session.userId = user._id;
            res.redirect('/users/hub');
        } else {
            res.redirect(`/error?error=Invalid credentials`);
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.redirect(`/error?error=${err}`);
    }
});

// GET -> Favorites
router.get('/favorites', fetchUser, (req, res) => {
    res.render('users/favorites', { favorites: req.user.favorites });
});

// GET -> Watched shows
router.get('/watched', fetchUser, (req, res) => {
    res.render('users/watched', { watched: req.user.watched });
});

// GET -> User hub
router.get('/hub', fetchUser, async (req, res) => {
  try {
    const user = req.user;
    
    // Fetch watchlist
    let watchlist = [];
    if (user.watchlist && user.watchlist.length > 0) {
      watchlist = await Show.find({ id: { $in: user.watchlist } });
      
      // Sort watchlist by next episode air date (closest first)
      watchlist.sort((a, b) => {
        // Get next episode air dates
        const aDate = a.next_episode_to_air && a.next_episode_to_air.air_date ? 
                      new Date(a.next_episode_to_air.air_date) : null;
        const bDate = b.next_episode_to_air && b.next_episode_to_air.air_date ? 
                      new Date(b.next_episode_to_air.air_date) : null;
        
        if (aDate && !bDate) return -1;
        if (!aDate && bDate) return 1;
        if (!aDate && !bDate) return 0;
        
        const today = new Date();
        
        // Shows with upcoming episodes first
        if (aDate > today && bDate <= today) return -1;
        if (aDate <= today && bDate > today) return 1;
        
        // For shows with upcoming episodes, closest date first
        if (aDate > today && bDate > today) return aDate - bDate;
        
        // For shows with past episodes, most recently aired first
        return bDate - aDate;
      });
      
      // Filter out shows with TBA/N/A air dates as requested
      watchlist = watchlist.filter(show => {
        return show.next_episode_to_air && 
               show.next_episode_to_air.air_date && 
               show.next_episode_to_air.air_date !== 'TBA' && 
               show.next_episode_to_air.air_date !== 'N/A';
      });
    }
    
    // Fetch watched shows (now including favorites)
    let watched = [];
    let watchedIds = [];
    
    // Add shows from watched list
    if (user.watched && user.watched.length > 0) {
      watchedIds = user.watched.map(item => item.showId);
    }
    
    // Add shows from favorites (if they're not already in watched)
    if (user.favorites && user.favorites.length > 0) {
      // Merge favorites into watched
      user.favorites.forEach(async (favoriteId) => {
        if (!watchedIds.includes(favoriteId)) {
          watchedIds.push(favoriteId);
          
          // Optionally, you might want to add these to the user's watched array in DB
          await User.findByIdAndUpdate(user._id, {
            $push: { 
              watched: { 
                showId: favoriteId, 
                user_rating: null,
                watch_date: new Date()
              } 
            }
          });
        }
      });
    }
    
    if (watchedIds.length > 0) {
      watched = await Show.find({ id: { $in: watchedIds } });
      
      // Add user rating to each show
      watched = watched.map(show => {
        const watchedItem = user.watched.find(item => item.showId === show.id);
        return {
          ...show.toObject(),
          user_rating: watchedItem ? watchedItem.user_rating : null,
          watch_date: watchedItem && watchedItem.watch_date ? 
            new Date(watchedItem.watch_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }) : null
        };
      });
      
      // Sort watched shows by rating (highest first), then by those without ratings
      watched.sort((a, b) => {
        if (a.user_rating && b.user_rating) return b.user_rating - a.user_rating;
        if (a.user_rating && !b.user_rating) return -1;
        if (!a.user_rating && b.user_rating) return 1;
        return 0;
      });
    }

    res.render('users/hub', {
      userId: req.session.userId,
      watched,
      watchlist
    });
  } catch (error) {
    console.error("Error in hub route:", error);
    res.redirect('/error?error=' + encodeURIComponent('Error loading user hub'));
  }
});


// Update rating for a show
router.post('/update-rating', async (req, res) => {
  try {
    const { userId, showId, rating } = req.body;
    
    if (!userId || !showId || !rating) {
      return res.status(400).send('Missing required fields');
    }
    
    // Make sure rating is a number between 1-5
    const userRating = parseInt(rating);
    if (isNaN(userRating) || userRating < 1 || userRating > 5) {
      return res.status(400).send('Invalid rating value');
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    // Check if the show is already in the watched list
    const watchedShowIndex = user.watched.findIndex(item => item.showId === parseInt(showId));
    
    if (watchedShowIndex !== -1) {
      // Update existing rating
      user.watched[watchedShowIndex].user_rating = userRating;
      user.watched[watchedShowIndex].rating_date = new Date();
    } else {
      // Add to watched with rating
      user.watched.push({
        showId: parseInt(showId),
        user_rating: userRating,
        watch_date: new Date(),
        rating_date: new Date()
      });
    }
    
    await user.save();
    
    // Redirect back to the hub page
    res.redirect('/users/hub');
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).send('Error updating rating');
  }
});






// GET -> User hub data
router.get('/hub', async (req, res) => {
    const { username, loggedIn, userId } = req.session;
    try {
        const response = await axios.get(`${API_BASE_URL}/tv/on_the_air?language=en-US`, { headers: HEADERS });
        const shows = response.data;
        res.render('users/hub', { shows, username, loggedIn, userId });
    } catch (error) {
        console.error('Error fetching show details:', error);
        res.status(500).send('Error fetching show details');
    }
});

// GET -> Logout - /users/logout
router.get('/logout', renderWithSession('users/logout'));

// DELETE -> Logout - /logout
router.delete('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

console.log('userController.js is connected');
module.exports = router;