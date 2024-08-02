// routes/auth.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiration } = require('../config/keys');
const auth = require('../middleware/auth');
const User = require('../models/User')
const findOrCreate = require('mongoose-findorcreate');
// import User from '../models/User';

const router = express.Router();

// Local Authentication
router.post('/register', async (req, res) => {
  // console.log("req.body is", req.body);
  const { email, password } = req.body;
  console.log("password is", password);
  try {
    const user = new User({ email, password });
    console.log('user is ', user);
    await user.save();
    // res.status(201).send('User registered');
    res.redirect('newregistration.html')
  } catch (err) {
    res.status(400).send('Error registering user');
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', { 
    successRedirect: ('/dashboard'),
    failureRedirect:('/')}, 
    (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ message: info ? info.message : 'Login failed' });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).send(err);
      }

      const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: jwtExpiration });
      return res.json({ token });
    });
  })(req, res, next);
});

// JWT Protected Route
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

router.get('/facebook',
  passport.authenticate('facebook', {scope: ['email']}));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    // console.log("res.body begins here", res.body);
    res.redirect('/');
  });

// Google OAuth Authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, jwtSecret, { expiresIn: jwtExpiration });
    res.redirect(`/?token=${token}`);
  }
);

module.exports = router;
