const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.TVDB_API_KEY;
const BASE_URL = 'https://api.thetvdb.com';

const TVDBService = {
  searchShows: async (queryParams) => {
    try {
      const response = await axios.get(`${BASE_URL}/search/series`, {
        params: queryParams,
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data from TVDB:', error);
      throw error;
    }
  }
};

module.exports = TVDBService;
