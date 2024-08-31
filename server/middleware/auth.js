// middleware/auth.js
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/keys');
const session = require('express-session');
const User = require('./../models/User');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).send('Authorization header missing');

  if (typeof authHeader !== 'string') {
    return res.status(400).send('Invalid Authorization header format');
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, jwtSecret);

    // Fetch full user object from database
    User.findById(decoded.userId)
      .then((user) => {
        if (!user) {
          return res.status(401).send('User not found');
        }

        req.user = user;
        next();
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error fetching user from database');
      });
  } catch (err) {
    res.status(401).send('Invalid token');
  }
};
