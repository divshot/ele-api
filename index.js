process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV !== 'production') {
  console.log('info: DEV MODE: loading environment variables');
  require('dotenv').load(); // Load local env values
}

require('./lib/db'); // Connect to database

var logger = require('./lib/logger');
var express = require('express');
var session = require('cookie-session');
var cors = require('cors');
var bodyParser = require('body-parser');
var boom = require('express-boom');
var setUserIfToken = require('./lib/middleware/set-user-if-token');
var context = require('./lib/middleware/context');

var app = module.exports = express();
var PORT = process.env.PORT || 3000;
var SESSION_NAME = 'ele.user';
var SESSION_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days
var SESSION_SECRET = process.env.SESSION_SECRET || 'yEkWdTDGin2ajoCbxzuEeDOZzLVoy8BM4tH7S_R2';
var sessionOptions = {
  name: SESSION_NAME,
  secret: SESSION_SECRET,
  maxage: SESSION_MAX_AGE
};

// Parse body
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(boom());
app.use(session(sessionOptions));
app.use(logger.network());
app.use(cors({
  origin: process.env.WEB_ORIGIN,
  credentials: true
}));

app.use(context()); // Attach context data to requests

var auth = require('./lib/auth')(app);

app.use(setUserIfToken());

// Initialize routes
[
  'packages',
  'user-packages',
  'user-package-files',
  'user-package-versions',
  'self'
].forEach(function (routeName) {
  require('./lib/routes/' + routeName)({
    app: app,
    auth: auth
  });
});

app.listen(PORT, function() {
  logger.info('Server started. Listening on port %d', PORT);
});