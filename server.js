const path = require('path');
require('dotenv').config();
const express = require('express');
const middleware = require('./utils/middleware');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./path-to-your-swagger.yaml');

const UserRouter = require('./controllers/userController')
const ShowRouter = require('./controllers/ShowsController')


const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for static files
middleware(app)

// Middleware for parsing request body
const axios = require('axios');
const baseURL = 'https://thetvdb.github.io/v4-api/#/Series/getSeriesExtended'; // Replace with your API's base URL
const apiKey = process.env.API_KEY; // The API key from your .env file

const fetchData = async () => {
  try {
    const response = await axios.get(`${baseURL}//lists/{id}/extended`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
fetchData();



app.get('/', (req, res) => {
    const { username, loggedIn, userId } = req.session
    // res.send('the app is connected')
    res.render('home.ejs', { username, loggedIn, userId })
})

app.use('/users', UserRouter);
app.use('/shows', ShowRouter);



app.get('/', (req, res) => {
  const { username, loggedIn, userId } = req.session;
  res.render('home', { username, loggedIn, userId }); // Assuming 'home.ejs' is in the 'views' directory
});

// Error page
app.get('/error', (req, res) => {
  const error = req.query.error || 'Something went wrong...try again';
  const { username, loggedIn, userId } = req.session;
  res.render('error', { error, userId, username, loggedIn }); // Assuming 'error.ejs' is in the 'views' directory
});



// Listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



