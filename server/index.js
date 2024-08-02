const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const routes = require('./routes/routes');
const port = process.env.PORT || 3000;
const authRoutes = require('./routes/auth'); // Import auth routes


const DIST_DIR = path.join(__dirname, '../dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');
const MongoURL = process.env.ATLAS_URI;

const passport = require('passport');
const session = require('express-session');
require('./config/passport'); // Initialize passport configuration

const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://www.example.com/auth/google/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));



// mongoose.connect(MongoURL,  { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(MongoURL);
const database = mongoose.connection;

database.on('error', (error) => {
  console.log(error)
})

database.once('connected', () => {
  console.log('Database Connected');
})

const app = express();


const mockResponse = {
  foo: 'bar',
  bar: 'foo'
};

app.use(express.json());
app.use(bodyParser.json());
app.use('/api', routes)
app.use('/api/auth', authRoutes); // Use the auth routes
app.use(express.static(DIST_DIR));

app.post('/api/sync', async (req, res) => {
  const data = req.body;
  // Save data to MongoDB
  // Assuming you have a Mongoose model named 'DataModel'
  try {
    await DataModel.create(data);
    res.status(200).send('Data synced successfully');
  } catch (error) {
    res.status(500).send('Failed to sync data');
  }
});

app.get('/api', (req, res) => {
  res.send(mockResponse);
});
app.get('/', (req, res) => {
 res.sendFile(HTML_FILE); 
});
app.listen(port, function () {
 console.log('App listening on port: ' + port);
});
