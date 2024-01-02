const Show = require('../models/show'); 
const mongoose = require('mongoose');


// async function addNewShow(showData) {
//     try {
//         let show = await Show.findOne({ showId: showData.showId });

//         if (!show) {
//             // Ensure all required fields are present
//             if (!showData.title || !showData.description) {
//                 throw new Error('Missing required fields: title or description');
//             }

//             show = new Show({
//                 showId: showData.showId,
//                 title: showData.title,
//                 genre: showData.genre,
//                 posterPath: showData.posterPath,
//                 description: showData.description,
//                 airDates: showData.airDates,
//                 seasons: showData.seasons,
//                 artworkUrl: showData.artworkUrl
//             });

//             await show.save();
//         }

//         return show;
//     } catch (err) {
//         console.error('Error saving the show:', err);
//         throw err;
//     }
// }


const User = require('../models/user');

async function addShowToFavorites(userId, showData) {
    try {
        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid userId');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Check if the show is already in the user's favorites
        const isAlreadyFavorite = user.favorites.some(favorite => favorite.showId === showData.showId);
        if (!isAlreadyFavorite) {
            // Add the show to the user's favorites with the showId, title, and posterPath
            user.favorites.push({
                showId: showData.showId,
                title: showData.title,
                posterPath: showData.posterPath
            });
            await user.save();
            return { message: 'Show added to favorites' };
        } else {
            return { message: 'Show is already in favorites' };
        }
    } catch (error) {
        console.error('Error adding show to favorites:', error);
        throw error;
    }

// const User = require('../models/user');

// async function addShowToFavorites(userId, showData) {
//     try {
//         // Validate userId
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             throw new Error('Invalid userId');
//         }

//         const user = await User.findById(userId);
//         if (!user) {
//             throw new Error('User not found');
//         }

//         // Check if the show is already in the user's favorites
//         const isAlreadyFavorite = user.favorites.some(favorite => favorite.showId === showData.showId);
//         if (!isAlreadyFavorite) {
//             // Add the show to the user's favorites with the showId, title, and posterPath
//             user.favorites.push({
//                 showId: showData.showId,
//                 title: showData.title,
//                 posterPath: showData.posterPath
//             });
//             await user.save();
//             return { message: 'Show added to favorites' };
//         } else {
//             return { message: 'Show is already in favorites' };
//         }
//     } catch (error) {
//         console.error('Error adding show to favorites:', error);
//         throw error;
//     }
}



module.exports = { addShowToFavorites };