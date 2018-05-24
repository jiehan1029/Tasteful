// this is a template for creating user account and store in database
// it is named as 'router.js', placed inside './users/' folder, and binds to 'server.js' (node-with-JWT-auth-server.js) file via 'index.js' inside './users/' folder
// also inside './users/' folder should be a 'models.js', where the users database model is defined, and linked to this router.js

/*
brief:
  1) check input (request.body) contains required fields
  2) check input fields have right type
  3) check input fields are trimmed (whitespace)
  4) check input fields are within size range
  5) check input doesn't conflict with existing account in the database
  6) if all above passed, create a new document and save into database
*/


'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {Users} = require('./models');

const router = express.Router();

// Post to register a new user
router.post('/', jsonParser, (req, res) => {
  // check requiredFields exist. (user's registration form may contain several fields, and only certain fields are definitely required)
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  // check certain fields have the right type (in front-end, ensure to have password type as string instead of number)
  const stringFields = ['username', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );
  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  // If the username and password aren't trimmed we give an error.  Users might expect that these will work without trimming (i.e. they want the password "foobar ", including the space at the end).  We need to reject such values explicitly so the users know what's happening, rather than silently trimming them and expecting the user to understand. We'll silently trim the other fields, because they aren't credentials used to log in, so it's less of a problem.
  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );
  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  // check size of certain fields are valid
  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 6,
      // bcrypt truncates after 72 characters, so let's not give the illusion
      // of security by storing extra (unused) info
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );
  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }
  
  let {username, password} = req.body;
  // Username and password come in pre-trimmed, otherwise we throw an error before this

  // all above checks passed. Lastly check if conflicts database and create an account if no conflict
  return Users.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      // If there is no existing user, hash the password. .hashPassword() is a model instance method defined in models.js
      return Users.hashPassword(password);
    })
    .then(hash => {
      return Users.create({
        username,
        password: hash
      });
    })
    .then(user => {
      // .serialize() is also a model instance method defined in models.js
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500 error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

// Never expose all your users like below in a prod application we're just doing this so we have a quick way to see if we're creating users. keep in mind, you can also verify this in the Mongo shell.
router.get('/', (req, res) => {
  return Users.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});


module.exports = {router};