const express = require('express');
const axios = require('axios');
const Show = require('../models/show');
require('dotenv').config();
const User = require('../models/user');

const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const LATEST_TV_SHOWS_URL = '/trending/tv/day?language=en-US&page=1';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const POPULAR_TV_SHOWS_URL = '/tv/popular?language=en-US&page=1';
const HEADERS = {
    'Accept': 'application/json',
     'Authorization': `Bearer ${TMDB_API_KEY}`,
    'Host': 'api.themoviedb.org'
};

// Fetch shows by genre

 router.get('/pages/browse', async (req, res) => {
   try {
     const genreResponse = await axios.get(`${API_BASE_URL}/genre/tv/list?language=en`, { headers: HEADERS });
    console.log(genreResponse.data); 

    const genres = genreResponse.data.genres; 
     console.log(genreResponse.data);
     res.render('pages/browse', { genres }); 
   } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching genres');
   }
 });

//////////////////////////////////////////////

//Render Shows by genre
 router.get('/pages/genre/:genreId', async (req, res) => {
  const genreId = req.params.genreId; 
  const url = `${API_BASE_URL}/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${genreId}`;

  try {
    const response = await axios.get(url, { headers: HEADERS });
    const userId = req.session.userId; 

    res.render('pages/genre', { shows: response.data.results, userId });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching TV shows for the genre');
  }
});
//////////////////////////////////////////////

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
//////////////////////////////////////////////

 //SHOW DETAILS PAGE

 router.get('/pages/show/:id', async (req, res) => {
  const { username, loggedIn, userId } = req.session;
  const { id } = req.params;
  try {
    const response = await axios.get(`${API_BASE_URL}/tv/${id}?language=en-US`, { headers: HEADERS });
    const show = response.data;
    console.log(show);
    res.render('pages/show', { show, username, loggedIn, userId });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching show details');
  }
});

////////////////////////////////////
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
    
    res.render('pages/popular', { shows: response.data.results, userId: req.session.userId});
  } catch (error) {
    console.error('error:', error);
    res.status(500).send('Error fetching TV shows');
  }
});


/////////////////////////////////////////////////// 

router.post('/update-rating', async (req, res) => {
  const { userId, showId, rating } = req.body;

  try {

    const user = await User.findById(userId);

    // UPDATE Rating
    const showToUpdate = user.watched.find(show => show.id === showId);
    if (showToUpdate) {
      showToUpdate.user_rating = Number(rating); 
      await user.save(); 
    }

    res.redirect('/users/hub');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while updating the rating.');
  }
});

/////////////////////////////////////////
router.post('/shows/add/', async (req, res) => {
  const { userId, id, name, poster_path } = req.body;

  try {
    // Find the user by userId
    console.log('userId:', userId);
const user = await User.findById(userId);
console.log('user:', user);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    user.favorites.push({ id, name, poster_path });

    await user.save();

    // Send a success response
    res.json({ message: 'Show added' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding show to favorites');
  }
});

/////////////////////////////////////////////////////

router.post('/shows/watched/add', async (req, res) => {
  const { userId, id, name, poster_path } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.watched.push({ id, name, poster_path });
    await user.save();

    res.json({ message: 'Show added to watched' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding show to watched');
  }
});

//////////////////////////////////////////////////////////

router.post('/shows/watchlist/add', async (req, res) => {
  const { userId, id, name, poster_path } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.watchlist.push({ id, name, poster_path });
    await user.save();

    res.json({ message: 'Show added to watchlist' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding show to watchlist');
  }
});


/////////////////////////////////////////////////// 


// ADD TO FAVORITES AND SAVE TO DB AND USER
router.post('/shows/add/:userId', async (req, res) => {
  console.log('Received request body:', req.body);

  try{

  const showData = req.body;
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).send("Invalid user ID");
}
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
     // console.log('Show saved successfully');
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
         res.redirect('/users/hub');
    } else {
      // If the show is already in favorites, you might want to send a different response
      res.json({ message: 'Show already in favorites', user });
    }

    // Send a success response
      // res.json({ message: 'Show added to favorites', user });
   } catch (err) {
    console.error(err);
     res.status(500).json({ message: 'An error occurred', error: err.toString() });
  }
 });
/////////////////////////////////////////////////// 
// ADD TO WATCHED SHOWS AND SAVE TO DB AND USER

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
      res.redirect('/users/hub');
    }
    
    // res.json({ message: 'Show added to watched list', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred', error: err.toString() });
  }
});

/////////////////////////////////////////////////// 
//  ADD TO WATCHLIST 

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
        id: show.id, 
        name: show.name,
        poster_path: showData.poster_path,
        last_air_date: show.last_air_date
      });

      await user.save();
      res.redirect('/users/hub');
    }
   // res.json({ message: 'Show added to watchlist', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred', error: err.toString() });
  }
});

console.log('showController is connected')
module.exports = router;












