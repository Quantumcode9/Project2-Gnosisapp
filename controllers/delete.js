const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Adjust path if needed



// Delete from watchlist
router.post('/delete-show/:showId', async (req, res) => {
    const showId = parseInt(req.params.showId);
    const userId = req.body.userId;
    
    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    try {
        const result = await User.findByIdAndUpdate(
            userId,
            { $pull: { watchlist: showId } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Show removed from watchlist' });
    } catch (error) {
        console.error('Delete from watchlist error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while deleting the show.' 
        });
    }
});

// Delete from watched
router.post('/delete-show-watched/:showId', async (req, res) => {
    const showId = parseInt(req.params.showId);
    const userId = req.body.userId;
    
    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    try {
        // Pull from watched array using showId
        const result = await User.findByIdAndUpdate(
            userId,
            { $pull: { watched: { showId: showId } } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Show removed from watched' });
    } catch (error) {
        console.error('Delete from watched error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while deleting the show from watched.' 
        });
    }
});

// Delete from favorites (keeping for compatibility)
router.post('/delete-show-favorites/:showId', async (req, res) => {
    const showId = parseInt(req.params.showId);
    const userId = req.body.userId;
    
    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    try {
        const result = await User.findByIdAndUpdate(
            userId,
            { $pull: { favorites: showId } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Show removed from favorites' });
    } catch (error) {
        console.error('Delete from favorites error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while deleting the show from favorites.' 
        });
    }
});

module.exports = router;