require('dotenv').load();

var Octokit = require('octokit');

var express = require('express');
var morgan  = require('morgan')
var session = require('cookie-session')

var app = express();
app.use(session({
  secret: process.env['SESSION_SECRET'] || 'yEkWdTDGin2ajoCbxzuEeDOZzLVoy8BM4tH7S_R2'
}));
app.use(morgan());

var auth = require('./lib/auth')(app);

auth.on('error', function(err, res) {
  console.error('there was a login error', err);
  res.send(err);
});

auth.on('token', function(token, res) {
  var gh = Octokit.new({token: token.access_token});
  var user = gh.getUser().getInfo().then(function(user) {
    res.redirect('/');
  }, function(err) {
    res.end(JSON.stringify(err));
  });
});

app.get('/', function(req, res) {
  res.end(JSON.stringify(req.session));
});

var server = app.listen(process.env['PORT'] || 3000, function() {
  console.log('Listening on port %d', server.address().port);
});