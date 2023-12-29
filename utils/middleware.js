const express = require('express') //express framework
const morgan = require('morgan') //morgan logger for request info
const session = require('express-session')
const MongoStore = require('connect-mongo') // connect-mongo(for the session)
require('dotenv').config()
const methodOverride = require('method-override') // for forms and CRUD
const path = require('path');
const cors = require('cors');




///  Middleware Function      ///
const middleware = (app) => {
  
    app.use(methodOverride('_method'))
    // this will allow us to get data from forms as req.body
    app.use(express.urlencoded({ extended: true }))
    // morgan logs our requests to the console
    app.use(morgan('tiny')) //tiny is a qualifier that says - be short
    // to serve stylesheets, we use static files in the public directory
    app.use(express.static('public'))
    app.use(express.static(path.join(__dirname, 'public')));
    // to utilize json we can add this:
    app.use(express.json())

    app.use(cors());

    app.use(session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL })
    }));

}







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
module.exports = middleware