require('dotenv').load();

var logger = require('./lib/logger');
var PORT = process.env['PORT'] || 3000;
var express = require('express');
var session = require('cookie-session');
var app = module.exports = express();

app.use(session({
  secret: process.env['SESSION_SECRET'] || 'yEkWdTDGin2ajoCbxzuEeDOZzLVoy8BM4tH7S_R2'
}));
app.use(logger.network());

var auth = require('./lib/auth')(app);

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

