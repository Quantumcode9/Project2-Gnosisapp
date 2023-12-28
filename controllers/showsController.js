const express = require('express');
const axios = require('axios');
const Show = require('../models/show');

const router = express.Router();
const apiKey = process.env.TVDB_API_KEY; 

const fetchSeriesData = async (seriesId) => {
    try {
        const response = await axios.get(`https://api.thetvdb.com/series/${seriesId}/extended`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            }
        });
        return response.data; // The series data
    } catch (error) {
        console.error('Error fetching series data:', error);
        throw error;
    }
};

router.get('/series/:id', async (req, res) => {
    try {
        const seriesData = await fetchSeriesData(req.params.id);
        res.render('seriesDetail', { series: seriesData });
    } catch (error) {
        res.status(500).send('Error fetching series');
    }
});

module.exports = router;












// const showsController = {
//   list: async (req, res) => {
//     try {
//       const shows = await Show.find(); // Fetch all shows from your database
//       res.render('pages/shows', { shows: shows });
//     } catch (error) {
//       res.status(500).send(error);
//     }
//   },
//   detail: async (req, res) => {
//     try {
//       const show = await Show.findById(req.params.id); // Fetch a single show by ID
//       res.render('pages/showDetail', { show: show });
//     } catch (error) {
//       res.status(500).send(error);
//     }
//   }
//   // Add more methods as needed
// };

