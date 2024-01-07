const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Replace with your actual user model path


// GET -> Delete Show from Watchlist -> /users/delete-show/:showId
router.post('/delete-show/:showId', async (req, res) => {
    const showId = req.params.showId;

    try {
        // Update all user documents, removing the show from their watchlists
        await User.updateMany(
            { 'watchlist.id': showId },
            { $pull: { watchlist: { id: showId } } }
        );

        res.redirect('/users/hub');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while deleting the show.');
    }
});

// GET -> Delete Show from Favorites -> /users/delete-show/:showId

router.post('/delete-show-watched/:showId', async (req, res) => {
    const showId = req.params.showId;

    try {
        await User.updateMany(
            { 'watched.id': showId },
            { $pull: { watched: { id: showId } } }
        );

        res.redirect('/users/hub');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while deleting the show from watched.');
    }
});

// Route to delete a show from the favorites list
router.post('/delete-show-favorites/:showId', async (req, res) => {
    const showId = req.params.showId;

    try {
        await User.updateMany(
            { 'favorites.id': showId },
            { $pull: { favorites: { id: showId } } }
        );

        res.redirect('/users/hub');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while deleting the show from favorites.');
    }
});


module.exports = router;

