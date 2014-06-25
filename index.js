require('dotenv').load(); // Load local env values
require('./lib/db'); // Connect to database

var logger = require('./lib/logger');
var PORT = process.env['PORT'] || 3000;
var express = require('express');
var session = require('cookie-session');
var cors = require('cors');
var bodyParser = require('body-parser')
var app = module.exports = express();

app.use(bodyParser.json());
app.use(cors());
app.use(session({
  name: 'ele.user',
  secret: process.env['SESSION_SECRET'] || 'yEkWdTDGin2ajoCbxzuEeDOZzLVoy8BM4tH7S_R2',
  maxage: 1000 * 60 * 60 * 24 * 30,
  cookie: {
    // QUESTION: should we use a different value in the env variables
    // to store this information
    domain: process.env.WEB_ORIGIN || process.env.ORIGIN,
  }
}));
app.use(logger.network());

// Adds helpful namespace for params
app.use(function (req, res, next) {
  req.meta = {};
  next();
});

var auth = require('./lib/auth')(app);

// app.use(function (req, res, next) {});

// Initialize routes
[
  'packages',
  'user-packages',
  'home'
].forEach(function (routeName) {
  require('./lib/routes/' + routeName)({
    app: app,
    auth: auth
  });
});

app.listen(PORT, function() {
  logger.info('Server started. Listening on port %d', PORT);
});