/////////////////////////////
//// Import Dependencies ////
/////////////////////////////
const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

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
    )

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

// POST -> Login
router.post('/login', async (req, res) => {
    // const { username, loggedIn, userId } = req.session

    // we can pull our credentials from the req.body
    const { username, password } = req.body

    // search the db for our user
    // since our usernames are unique, we can use that
    User.findOne({ username })
        .then(async (user) => {
            // if the user exists
            if (user) {
                // compare the password
                const result = await bcrypt.compare(password, user.password)

                if (result) {
                    // if the pws match -> log them in and create the session
                    req.session.username = username
                    req.session.loggedIn = true
                    req.session.userId = user.id

                    // once we're logged in, redirect to the home page
                    res.redirect('')
                } else {
                    res.redirect(`/error?error=something%20wrong%20with%20credentials`)
                }

            } else {
                res.redirect(`/error`)
            }
        })
        .catch(err => {
            console.log('error')
            res.redirect(`/error?error=${err}`)
        })
})

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

///////////////////////
//// Export Router ////
///////////////////////
module.exports = router;
