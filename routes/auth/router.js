'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const config = require('../../config');
const router = express.Router();

const createAuthToken = function(user) {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

// passport LocalStrategy must be defined in the strategies.js file, and registered in server.js using
/*
passport.use(localStrategy);
*/
const localAuth = passport.authenticate('local', {session: false});

router.use(bodyParser.json());
// The user provides a username and password to login
router.post('/login', localAuth, (req, res) => {
	console.log('request body to auth login is ')
	console.log(req.body);
	const authToken = createAuthToken(req.user.serialize());
    res.json({authToken});
});

// similarly, the strategy needs to be defined and registered
const jwtAuth = passport.authenticate('jwt', {session: false});

// The user exchanges a valid JWT for a new one with a later expiration
router.post('/refresh', jwtAuth, (req, res) => {
    const authToken = createAuthToken(req.user);
    res.json({authToken});
});

module.exports = {router};