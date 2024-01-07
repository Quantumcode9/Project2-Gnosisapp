const express = require('express');
const axios = require('axios');
const Show = require('../models/show');
require('dotenv').config();
const client = require('../utils/connection');
const User = require('../models/user');

const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const LATEST_TV_SHOWS_URL = '/trending/tv/day?language=en-US&page=1';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const POPULAR_TV_SHOWS_URL = '/tv/popular?language=en-US&page=1';
const HEADERS = {
    'Accept': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNzI0MmRmZmQ1ZTA3ZmFkNzFmYjc1MWFjZjY2MjY1MiIsInN1YiI6IjY1OGYwZjQ0MGQyZjUzNWNjZWQzZDRmOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.J-Rmx8CA0fnwbMwHLG5pTqTxjKE-1abuG1by44-kN1s',
    // 'Authorization': `Bearer ${TMDB_API_KEY}`,
    'Host': 'api.themoviedb.org'
};



// Fetch shows by genre

 router.get('/pages/browse', async (req, res) => {
   try {
     const genreResponse = await axios.get(`${API_BASE_URL}/genre/tv/list?language=en`, { headers: HEADERS });
    console.log(genreResponse.data); // Log the response data

    const genres = genreResponse.data.genres; // Extract genres from the response
     console.log(genres);
     res.render('pages/browse', { genres }); // Pass genres to the EJS template
   } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching genres');
   }
 });



//Fetch latest TV shows


router.get('/pages/latest', (req, res) => {
const { username, loggedIn, userId } = req.session;
axios(`${API_BASE_URL}${LATEST_TV_SHOWS_URL}`, { headers: HEADERS })
  .then(apiRes => {

res.render('pages/latest', { shows: apiRes.data.results, username, loggedIn, userId });
})

.catch(err => {
 console.log(err)
  res.send('error')
}
 )
 })
///////////////////////////////////////////

   // more duplicate code

   router.get('/users/hub', (req, res) => {
    const { username, loggedIn, userId } = req.session;
    const { id } = req.params;
    axios(`${API_BASE_URL}/tv/${id}?language=en-US`, { headers: HEADERS })
    .then(apiRes => {
      console.log('this came back from the api: \n', apiRes.data)
      res.render('users/hub', { show: apiRes.data, username, loggedIn, userId });
    })
    .catch(err => {
      console.log(err)
      res.send('error')
    } 
      )
  })
//////////////////////////////////////////////



 //SHOW DETAILS PAGE

 router.get('/pages/show/:id', async (req, res) => {
  const { username, loggedIn, userId } = req.session;
  const { id } = req.params;
  try {
    const response = await axios.get(`${API_BASE_URL}/tv/${id}?language=en-US`, { headers: HEADERS });
    const show = response.data;
    res.render('pages/show', { show , username, loggedIn, userId });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching show details');
  }
});


////////////////////////////////////
 // render the details page
 router.get('/pages/show/:id', (req, res) => {
  const { username, loggedIn, userId } = req.session;
  const { id } = req.params;
  axios(`${API_BASE_URL}/tv/${id}?language=en-US`, { headers: HEADERS })
  .then(apiRes => {
    res.render('pages/show', { show: apiRes.data, username, loggedIn, userId });
  })
  .catch(err => {
    console.log(err)
    res.send('error')
  } 
    )
})
//////////////////////////////////////////////




 


 router.get('/search-tv-shows', async (req, res) => {
  const query = req.query.q;
  try {
     const response = await axios.get(`${API_BASE_URL}/search/tv?query=${query}`,{ headers: HEADERS })
      // Process and filter the API response as needed
      res.json(response.data.results);
  } catch (error) {
     console.error(error);
     res.status(500).send('Error during search');
}
});



router.get('/partials/modal/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`${API_BASE_URL}/tv/${id}?language=en-US`, { headers: HEADERS });
    const show = response.data;
    res.render('partials/modal', { id, show });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching show details');
  }
});

//POPULAR SHOWS PAGE

router.get('/pages/popular', async (req, res) => {
  const { username, loggedIn, userId } = req.session;
  const url = `${API_BASE_URL}${POPULAR_TV_SHOWS_URL}`;

  try {
    const response = await axios.get(url, { headers: HEADERS });
    console.log(response.data.results);
    // Render your EJS view here, passing the TV shows data
    res.render('pages/popular', { shows: response.data.results, userId: req.session.userId});
  } catch (error) {
    console.error('error:', error);
    res.status(500).send('Error fetching TV shows');
  }
});


// 

router.post('/update-rating', async (req, res) => {
  const { userId, showId, rating } = req.body;

  try {
    // Assuming you have a User model with a 'watched' array
    const user = await User.findById(userId);

    // Find the show in the 'watched' array and update the rating
    const showToUpdate = user.watched.find(show => show.id === showId);
    if (showToUpdate) {
      showToUpdate.user_rating = Number(rating); // Make sure it's a number
      await user.save(); // Save the updated user document
    }

    res.redirect('/users/hub');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while updating the rating.');
  }
});






router.get('/home', async (req, res) => {
  try {
      await client.connect();
      const db = client.db('TVDB');
      const collection = db.collection('shows');

      const tvShows = await collection.find({}).toArray();
      res.render('home', { tvShows }); 
  } catch (error) {
      console.error('Error fetching TV shows:', error);
      res.status(500).send('Error fetching TV shows');
  } finally {
      await client.close();
  }
});


// ADD TO FAVORITES AND SAVE TO DB AND USER
router.post('/shows/add/:userId', async (req, res) => {
  console.log('Received request body:', req.body);

  try{

  const showData = req.body;
  const userId = req.params.userId;
  const lastEpisodeToAir = showData.last_episode_to_air ? JSON.parse(showData.last_episode_to_air) : {};
  const nextEpisodeToAir = showData.next_episode_to_air ? JSON.parse(showData.next_episode_to_air) : {};
   let show = await Show.findOne({ id: showData.id });

 if (!show) {
 show = new Show({
    id: showData.id,
    name: showData.name,
    poster_path: showData.poster_path,
    last_episode_to_air: lastEpisodeToAir,
    next_episode_to_air: nextEpisodeToAir,
    number_of_episodes: showData.number_of_episodes ? Number(showData.number_of_episodes) : 0,
    number_of_seasons: showData.number_of_seasons ? Number(showData.number_of_seasons) : 0,
    seasons: showData.seasons,
    vote_average: showData.vote_average,
    vote_count: showData.vote_count,
    overview: showData.overview,
    tagline: showData.tagline,
    genres: showData.genres,
    in_production: showData.in_production,
    networks: showData.networks,
    status: showData.status,
    homepage: showData.homepage,
    last_air_date: showData.last_air_date ? new Date(showData.last_air_date) : null,

  });

  await show.save();
      console.log('Show saved successfully');
    }

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const isShowAlreadyFavorited = user.favorites.some(favorite => favorite.id === show.id);

    if (!isShowAlreadyFavorited) {
      user.favorites.push({
        id: show.id, // not MongoDB ObjectId
        name: show.name,
        poster_path: showData.poster_path,
        last_air_date: show.last_air_date
      });

      await user.save();
      console.log('User updated with new favorite');
    }

    // Send a success response
    res.json({ message: 'Show added to favorites', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred', error: err.toString() });
  }
});



// ADD TO WATCHLIST AND SAVE TO DB AND USER

router.post('/shows/watched/add/:userId', async (req, res) => {
   console.log('Received request body:', req.body);

  try {
  const showData = req.body;
  const userId = req.params.userId;
  const lastEpisodeToAir = showData.last_episode_to_air ? JSON.parse(showData.last_episode_to_air) : {};
  const nextEpisodeToAir = showData.next_episode_to_air ? JSON.parse(showData.next_episode_to_air) : {};
   let show = await Show.findOne({ id: showData.id });

 if (!show) {
 show = new Show({
    id: showData.id,
    name: showData.name,
    poster_path: showData.poster_path,
    last_episode_to_air: lastEpisodeToAir,
    next_episode_to_air: nextEpisodeToAir,
    number_of_episodes: showData.number_of_episodes ? Number(showData.number_of_episodes) : 0,
    number_of_seasons: showData.number_of_seasons ? Number(showData.number_of_seasons) : 0,
    seasons: showData.seasons,
    vote_average: showData.vote_average,
    vote_count: showData.vote_count,
    overview: showData.overview,
    tagline: showData.tagline,
    genres: showData.genres,
    in_production: showData.in_production,
    networks: showData.networks,
    status: showData.status,
    homepage: showData.homepage,
    last_air_date: showData.last_air_date ? new Date(showData.last_air_date) : null,


      });

      await show.save();
      console.log('Show saved successfully');
    }

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const isShowAlreadyWatched = user.watched.some(watched => watched.id === show.id);

    if (!isShowAlreadyWatched) {
      user.watched.push({
        id: show.id, // not MongoDB ObjectId
        name: show.name,
        poster_path: showData.poster_path,
        last_air_date: show.last_air_date,
        user_rating: show.user_rating
      });

      await user.save();
      console.log('User updated with new watched show');
    }

    // Send a success response
    // res.json({ message: 'Show added to watched list', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred', error: err.toString() });
  }
});


//  ADD TO WATCHLIST AND SAVE TO DB AND USER

router.post('/shows/watchlist/add/:userId', async (req, res) => {

  console.log('Received request body:', req.body);

  try {
  const showData = req.body;
   const userId = req.params.userId;
   
   const lastEpisodeToAir = showData.last_episode_to_air ? JSON.parse(showData.last_episode_to_air) : {};
  const nextEpisodeToAir = showData.next_episode_to_air ? JSON.parse(showData.next_episode_to_air) : {};

    let show = await Show.findOne({ id: showData.id });
  if (!show) {
         show = new Show({
      id: showData.id,
      name: showData.name,
       poster_path: showData.poster_path,
      last_episode_to_air: lastEpisodeToAir,
       next_episode_to_air: nextEpisodeToAir,
      number_of_episodes: showData.number_of_episodes ? Number(showData.number_of_episodes) : 0,
       number_of_seasons: showData.number_of_seasons ? Number(showData.number_of_seasons) : 0,
       seasons: showData.seasons,
       vote_average: showData.vote_average,
      vote_count: showData.vote_count,
      overview: showData.overview,
      tagline: showData.tagline,
       genres: showData.genres,
       in_production: showData.in_production,
      networks: showData.networks,
      status: showData.status,
       homepage: showData.homepage,
       last_air_date: showData.last_air_date ? new Date(showData.last_air_date) : null,
     });
     await show.save();
    console.log('Show saved successfully');
   }
   const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const isShowAlreadyInWatchlist = user.watchlist.some(watchlistItem => watchlistItem.id === show.id);

    if (!isShowAlreadyInWatchlist) {
      user.watchlist.push({
        id: show.id, // not MongoDB ObjectId
        name: show.name,
        poster_path: showData.poster_path,
        last_air_date: show.last_air_date
      });

      await user.save();
      console.log('User updated with new watchlist item');
    }

    // Send a success response
    res.json({ message: 'Show added to watchlist', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred', error: err.toString() });
  }
});





router.post('/add-tv-show', async (req, res) => {
  try {
      await client.connect();
      const db = client.db('TVDB');
      const collection = db.collection('shows');
      const { title, imageUrl } = req.body;

      await collection.insertOne({ title, imageUrl });
      res.redirect('/tv-shows');
  } catch (error) {
      console.error('Error adding TV show:', error);
      res.status(500).send('Error adding TV show');
  } finally {
      await client.close();
  }
});


console.log('showController is connected')
module.exports = router;









// // Fetch popular TV shows
// router.get('/popular-shows', async (req, res) => {
//   try {
//     const response = await axios.get(`https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}`);
//     res.render('popularShows', { shows: response.data.results });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error fetching popular TV shows');
//   }
// })

// console.log('showController is connected')








// // Fetch genres
// router.get('/genres', async (req, res) => {
//   try {
//     const response = await axios.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}`);
//     res.render('genres', { genres: response.data.genres });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error fetching genres');




