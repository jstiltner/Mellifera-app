const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes/routes');
const authRoutes = require('./routes/auth');
const hiveRoutes = require('./routes/hiveRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const boxRoutes = require('./routes/boxRoutes');

const passport = require('passport');
const session = require('express-session');
require('./config/passport');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

const port = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '../dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');
const MongoURL = process.env.ATLAS_URI;

mongoose.connect(MongoURL);
const database = mongoose.connection;

database.on('error', (error) => {
  console.log(error);
});

database.once('connected', () => {
  console.log('Database Connected');
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api', routes);
app.use('/api/hives', hiveRoutes);
app.use('/api', inspectionRoutes); // Updated this line for consistency
app.use('/auth', authRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api', boxRoutes);

// Serve static files
app.use(express.static(DIST_DIR));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/sync', async (req, res) => {
  const data = req.body;
  // Save data to MongoDB
  // Assuming you have a Mongoose model named 'DataModel'
  try {
    await DataModel.create(data);
    res.status(200).json({ message: 'Data synced successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to sync data' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(HTML_FILE);
});

app.listen(port, function () {
  console.log('App listening on port: ' + port);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});

module.exports = app;
