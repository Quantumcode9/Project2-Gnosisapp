const path = require('path');
require('dotenv').config();
const express = require('express');
const middleware = require('./utils/middleware');



const UserRouter = require('./controllers/userController')
const ShowRouter = require('./controllers/ShowsController')


const app = express();

app.use(express.urlencoded({ extended: true }));



// EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for static files
middleware(app)



app.get('/', (req, res) => {
    const { username, loggedIn, userId } = req.session
    // res.send('the app is connected')
    res.render('pages/home', { username, loggedIn, userId })
})

app.use('/users', UserRouter);
app.use('/shows', ShowRouter);



// Error page
app.get('/error', (req, res) => {
  const error = req.query.error || 'Something went wrong...try again';
  const { username, loggedIn, userId } = req.session;
  res.render('error', { error, userId, username, loggedIn }); // Assuming 'error.ejs' is in the 'views' directory
});



// Listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



