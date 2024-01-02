/////////////////////////////
//// Import Dependencies ////
/////////////////////////////
const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
require('dotenv').config()

///////////////////////
//// Create Router ////
///////////////////////
const router = express.Router()

//////////////////////////////
//// Routes + Controllers ////
//////////////////////////////
// GET -> SignUp - /users/signup
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

    // we can now create our user
    User.create(newUser)
        .then(user => {
            // the new user will be created and redirected to the login page
            res.redirect('/users/login')
        })
        .catch(err => {
            console.log('error')

            res.redirect(`/error?error=${err}`)
        })
})


// GET -> Login -> /users/login
router.get('/login', (req, res) => {
    const { username, loggedIn, userId } = req.session

    res.render('users/login', { username, loggedIn, userId })
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    User.findOne({ username })
        .then(async (user) => {
            // if the user exists
            if (user) {
                const result = await bcrypt.compare(password, user.password);

                if (result) {
                    req.session.username = username;
                    req.session.loggedIn = true;
                    req.session.userId = user._id; // Use _id for MongoDB ObjectId

                    res.redirect('/');
                } else {
                    res.redirect(`/error?error=Invalid credentials`);
                }
            } else {
                res.redirect(`/error?error=User not found`);
            }
        })
        .catch(err => {
            console.error('error', err); // Enhanced logging for debugging
            res.redirect(`/error?error=${err}`);
        });
});


router.get('/favorites', async (req, res) => {
    try {
      const user = await User.findById(req.session.userId).populate('favorites');
      const favorites = user.favorites;
      res.render('users/favorites', { favorites }); // Pass favorites to the template
    } catch (err) {
      console.error(err);
      res.status(500).send('An error occurred while trying to fetch favorites');
    }
  });



// GET -> Logout - /users/logout
router.get('/logout', (req, res) => {
    const { username, loggedIn, userId } = req.session

    res.render('users/logout', { username, loggedIn, userId })
})
// DELETE -> Logout
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