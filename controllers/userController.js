/////////////////////////////
//// Import Dependencies ////
/////////////////////////////
const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
require('dotenv').config()
const axios = require('axios');
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';
const HEADERS = {
	'Accept': 'application/json',
    'Authorization': `Bearer ${TMDB_API_KEY}`,
	'Host': 'api.themoviedb.org'
};
///////////////////////
//// Create Router ////
///////////////////////
const router = express.Router()
//////////////////////////////
//// Routes + Controllers ////
//////////////////////////////
router.get('/signup', (req, res) => {
    const { username, loggedIn, userId } = req.session

    res.render('users/signup', { username, loggedIn, userId })
});

// POST -> SignUp - /users/signup
router.post('/signup', async (req, res) => {
    const newUser = req.body
    newUser.password = await bcrypt.hash(
        newUser.password, 
        await bcrypt.genSalt(10)
    );
    User.create(newUser)
        .then(user => {
        res.redirect('/users/login')
        })
        .catch(err => {
            console.log('error')
     res.redirect(`/error?error=${err}`)
    })
})

// GET -> Login - /users/login
router.get('/login', (req, res) => {
    const { username, loggedIn, userId } = req.session
res.render('users/login', { username, loggedIn, userId })
})
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    User.findOne({ username })
        .then(async (user) => {
            if (user) {
                const result = await bcrypt.compare(password, user.password);

                if (result) {
                    req.session.username = username;
                    req.session.loggedIn = true;
                    req.session.userId = user._id; 

                    res.redirect('/users/hub');
                } else {
                    res.redirect(`/error?error=Invalid credentials`);
                }
            } else {
                res.redirect(`/error?error=User not found`);
            }
        })
        .catch(err => {
            console.error('error', err); 
            res.redirect(`/error?error=${err}`);
        });
});

async function fetchUser(req, res) {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
    if (!user) {
         res.status(404).send('User not found');
    return null;
}
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Error processing request');
        return null;
    }
}

// get favorites
router.get('/favorites', async (req, res) => {
	const user = await fetchUser(req, res);
	if (user) {
		res.render('users/favorites', {
			favorites: user.favorites
		});
	}
});
// get watched shows
router.get('/watched', async (req, res) => {
	const user = await fetchUser(req, res);
	if (user) {
		res.render('users/watched', {
			watched: user.watched
		});
	}
});
// user hub
router.get('/hub', async (req, res) => {
	const user = await fetchUser(req, res);
	if (user) {
		res.render('users/hub', {
			userId: req.session.userId,
			favorites: user.favorites,
			watched: user.watched,
			watchlist: user.watchlist
		});
	}
});
// userhub data
router.get('/users/hub', async (req, res) => {
	console.log('Fetching show details');
	const {
		username,
		loggedIn,
		userId
	} = req.session;
	try {
		const response = await axios.get(`${API_BASE_URL}/tv/on_the_air?language=en-US`, {
			headers: HEADERS
		});
		const shows = response.data;
		console.log(shows);
		res.render('users/hub', {
			shows,
			username,
			loggedIn,
			userId
		});
	} catch (error) {
		console.error(error);
		res.status(500).send('Error fetching show details');
	}
});
// GET -> Logout - /users/logout
router.get('/logout', (req, res) => {
	const {
		username,
		loggedIn,
		userId
	} = req.session
	res.render('users/logout', {
		username,
		loggedIn,
		userId
	})
})
// DELETE -> Logout - /logout
router.delete('/logout', (req, res) => {
	req.session.destroy(() => {
		res.redirect('/')
	})
})
console.log('userController.js is connected')
module.exports = router;
///////////////////////
//// Export Router ////
///////////////////////