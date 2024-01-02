const Show = require('../models/show'); 
const mongoose = require('mongoose');


async function addNewShow(showData) {
    try {
        let show = await Show.findOne({ showId: showData.showId });

        if (!show) {
            // Ensure all required fields are present
            if (!showData.title || !showData.description) {
                throw new Error('Missing required fields: title or description');
            }

            show = new Show({
                showId: showData.showId,
                title: showData.title,
                genre: showData.genre,
                posterPath: showData.posterPath,
                description: showData.description,
                airDates: showData.airDates,
                seasons: showData.seasons,
                artworkUrl: showData.artworkUrl
            });

            await show.save();
        }

        return show;
    } catch (err) {
        console.error('Error saving the show:', err);
        throw err;
    }
}

const User = require('../models/user');
async function addShowToFavorites(userId, showData) {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid userId');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Validate required showData fields
        if (!showData.title || !showData.posterPath || !showData.ShowId) {
            throw new Error('Missing required show data: title, posterPath, or showId');
        }

        let show = await Show.findOne({ showId: showData.showId });
        if (!show) {
            show = new Show({
                showId: showData.showId,
                title: showData.title,
                posterPath: showData.posterPath,
                // Add other fields from showData as needed
            });
            await show.save();
        }

        const showObjectId = show._id;
        if (user.favorites.includes(showObjectId)) {
            return { message: 'Show is already in favorites' };
        }

        user.favorites.push(showObjectId);
        await user.save();
        return { message: 'Show added to favorites' };
    } catch (error) {
        console.error('Error adding show to favorites:', error);
        throw error;
    }
}

//OBJECT
// async function addShowToFavorites(userId, showId) {
//     try {
//         // Validate userId
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             throw new Error('Invalid userId');
//         }

//         const user = await User.findById(userId);
//         if (!user) {
//             throw new Error('User not found');
//         }

//         // Find the show using the string showId
//         const show = await Show.findOne({ showId: showId });
//         if (!show) {
//             throw new Error('Show not found');
//         }

        

//         // Use the show's ObjectId
//         const showObjectId = show._id;

//         // Check if already a favorite
//         const isAlreadyFavorite = user.favorites.some(favorite => favorite.equals(showObjectId));
//         if (!isAlreadyFavorite) {
//             user.favorites.push(showObjectId);
//             await user.save();
//             return { message: 'Show added to favorites' };
//         } else {
//             return { message: 'Show is already in favorites' };
//         }
//     } catch (error) {
//         console.error('Error adding show to favorites:', error);
//         throw error;
//     }
// }

module.exports = { addNewShow, addShowToFavorites };