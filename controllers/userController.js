const express = require('express')
const User = require('../models/user')
const Show = require('../models/show')
const bcrypt = require('bcryptjs')
require('dotenv').config()
const axios = require('axios')
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3'
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
    const user = await User.findById(req.user._id)
      .populate('favorites.last_episode_to_air')
      .populate('favorites.next_episode_to_air')
      .populate('watched.last_episode_to_air')
      .populate('watched.next_episode_to_air')
      .populate('watchlist.last_episode_to_air')
      .populate('watchlist.next_episode_to_air');

res.render('users/hub', {
userId: req.session.userId,
favorites: user.favorites,
watched: user.watched,
watchlist: user.watchlist
});
} catch (error) {
console.error(error);
res.status(500).send('Error fetching user hub');
}
});

// GET -> User hub data
router.get('/users/hub', async (req, res) => {
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