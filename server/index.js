const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const routes = require('./controllers/index');
const voiceProcessingRoutes = require('./controllers/voiceProcessingRoutes');
const passport = require('passport');
const session = require('express-session');
require('./config/passport');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const { initializeServiceChecks } = require('./services/serviceAvailability');
const serviceStatusController = require('./controllers/serviceStatus');

// Import all models
require('./models/Box');
require('./models/Hive');
require('./models/Inspection');
require('./models/Apiary');
require('./models/User');
require('./models/Feeding');

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

// Update CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5050',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5050',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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

// Routes
app.use('/api', routes);
app.use('/api', voiceProcessingRoutes);

// Service status routes
app.get('/api/services/status', serviceStatusController.getStatus);
app.get('/api/services/features', serviceStatusController.getAvailableFeatures);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.post('/api2/sync', async (req, res) => {
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

// Serve static files
app.use(express.static(DIST_DIR));
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route handler
app.get('*', (req, res) => {
  res.sendFile(HTML_FILE);
});

// Initialize and log service availability
initializeServiceChecks();

app.listen(port, function () {
  console.log('App listening on port: ' + port);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});

module.exports = app;
