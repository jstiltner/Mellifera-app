// routes/auth.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { jwtSecret, jwtExpiration } = require('../config/keys');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

/**
 * Hand a freshly minted JWT to the browser after an OAuth callback.
 *
 * Both callbacks used to do `res.redirect('/?token=' + token)`. A query string is the worst
 * available place for a bearer credential: it is written to the browser's history, sent in the
 * Referer header of every outbound link on the landing page, and recorded verbatim in the access
 * log of anything the redirect passes through — an nginx front end, a CDN, an analytics tag. None
 * of those places expire it; it stays valid for `jwtExpiration` wherever it landed.
 *
 * A cookie is the transport the browser was built to protect. HttpOnly keeps it away from XSS,
 * SameSite=Lax keeps it off cross-site state-changing requests, and Secure keeps it off plaintext
 * once NODE_ENV is production.
 *
 * Known gap, deliberately not papered over here: the SPA never consumed `?token=` either — nothing
 * under src/ reads location.search or location.hash, and AuthContext only restores a token from
 * storage. So OAuth sign-in did not actually log anyone in before this change and still does not.
 * Completing it needs `req.cookies` on the API (cookie-parser) plus a client-side session bootstrap,
 * which is a feature, not a security fix, and does not belong in this change.
 */
function issueAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  });
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Error registering user
 */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Error registering user' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Login failed
 *       500:
 *         description: Error logging in
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ message: info ? info.message : 'Login failed' });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in' });
      }

      const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: jwtExpiration });
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    });
  })(req, res, next);
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
});

/**
 * @swagger
 * /auth/facebook:
 *   get:
 *     summary: Initiate Facebook authentication
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Facebook for authentication
 */
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

/**
 * @swagger
 * /auth/facebook/callback:
 *   get:
 *     summary: Facebook authentication callback
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Sets an HttpOnly session cookie and redirects to the application
 */
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, jwtSecret, { expiresIn: jwtExpiration });
    issueAuthCookie(res, token);
    res.redirect('/');
  }
);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Google for authentication
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth authentication callback
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Sets an HttpOnly session cookie and redirects to the application
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, jwtSecret, { expiresIn: jwtExpiration });
    issueAuthCookie(res, token);
    res.redirect('/');
  }
);

module.exports = router;
