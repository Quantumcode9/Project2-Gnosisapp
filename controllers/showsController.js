
const express = require('express')
const axios = require('axios')
const Show = require('../models/show'); 

///////////////////////
//// Create Router ////
///////////////////////
const router = express.Router()



const showsController = {
  list: async (req, res) => {
    try {
      const shows = await Show.find(); // Fetch all shows from your database
      res.render('pages/shows', { shows: shows });
    } catch (error) {
      res.status(500).send(error);
    }
  },
  detail: async (req, res) => {
    try {
      const show = await Show.findById(req.params.id); // Fetch a single show by ID
      res.render('pages/showDetail', { show: show });
    } catch (error) {
      res.status(500).send(error);
    }
  }
  // Add more methods as needed
};

module.exports = router;
