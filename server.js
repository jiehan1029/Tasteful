'use strict';

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const path=require('path');
const hbs=require('express-handlebars');

// will have two router modules with the same name (router) but in different path (/auth and /users), so rename them when importing to server.js using destructuring assignment
const { router: usersRouter } = require('./routes/users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./routes/auth');
const { router: recipesRouter } = require('./routes/recipes');
const { router: recipeBooksRouter} = require('./routes/recipe-books');
const { router: indexRouter} = require('./routes/index');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');

const app = express();

// Logging
app.use(morgan('common'));

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

// this is to register the strategies so that can be used in authentication ('/auth/router.js')
passport.use(localStrategy);
passport.use(jwtStrategy);

// serve static asset
app.use(express.static(path.join(__dirname, 'public')));

// load view engine
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layouts'}));
app.set('views',path.join(__dirname,'views'));
app.set('view engine','hbs');

// serve index page
app.get('/', indexRouter);
// to create user account (no credential is needed nor created at this step)
app.use('/users/', usersRouter);
// given username & password, create credential (JWT) that can be used to access protected resources in the server, i.e., the '/api/protected' path in this case
app.use('/auth/', authRouter);
// call 3rd party api to search recipes
app.use('/recipes/', recipesRouter);

// { session: false } is to prevent CSRF attacks
const jwtAuth = passport.authenticate('jwt', { session: false });

// A protected endpoint which needs a valid JWT to access it
app.use('/recipe-books/', jwtAuth, recipeBooksRouter);

// add other routers as needed

// catch any un-specified path
app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

let server;

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };