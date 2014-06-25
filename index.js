require('dotenv').load();

var logger = require('./lib/logger');
var PORT = process.env['PORT'] || 3000;
var express = require('express');
var session = require('cookie-session');
var cors = require('cors');
var app = module.exports = express();

app.use(cors());
app.use(session({
  secret: process.env['SESSION_SECRET'] || 'yEkWdTDGin2ajoCbxzuEeDOZzLVoy8BM4tH7S_R2'
}));
app.use(logger.network());

// Adds helpful namespace for params
app.use(function (req, res, next) {
  req.meta = {};
  next();
});

var auth = require('./lib/auth')(app);

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