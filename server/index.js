const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const routes = require('./routes/routes');
const port = process.env.PORT || 3000;


const DIST_DIR = path.join(__dirname, '../dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');
const MongoURL = process.env.ATLAS_URI;


mongoose.connect(MongoURL,  { useNewUrlParser: true, useUnifiedTopology: true });
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

app.use(bodyParser.json());
app.use('/api', routes)
app.use(express.static(DIST_DIR));

// Register service worker
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch((error) => {
    console.error('Service Worker registration failed:', error);
  });
}



app.get('/api', (req, res) => {
  res.send(mockResponse);
});
app.get('/', (req, res) => {
 res.sendFile(HTML_FILE); 
});
app.listen(port, function () {
 console.log('App listening on port: ' + port);
});
