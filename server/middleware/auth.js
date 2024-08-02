// middleware/auth.js
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/keys');
const session = require('express-session');

module.exports = function(req, res, next) {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) return res.status(401).send('No token, authorization denied');

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).send('Invalid token');
  }
};
