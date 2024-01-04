const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');


const middleware = (app) => {
    // Configure session middleware first
    app.use(session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL })
    }));

    // Middleware to set common variables for all views
    app.use((req, res, next) => {
        res.locals.loggedIn = req.session?.loggedIn;
        res.locals.username = req.session?.username;
        next();
    });
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    // Other middlewares
    app.use(methodOverride('_method'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('tiny'));
    app.use(express.static('public'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.json());
    app.use(cors());

    app.set('view engine', 'ejs');
}

module.exports = middleware;









//     app.use(
//         session({
//             secret: process.env.SECRET,
//             store: MongoStore.create({
//                 mongoUrl: process.env.DATABASE_URL
//             }),
//             saveUninitialized: true,
//             resave: false
//         })
//     )
// }

////////////////////////////////////////////
//// Export the Middleware Function     ////
////////////////////////////////////////////
