const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Replace with your actual user model path



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

module.exports = router;

