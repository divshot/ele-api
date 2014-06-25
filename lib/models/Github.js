var Octokit = require('octokit');
var request = require('request');

var Github = module.exports = function (token) {
  this.host = 'https://api.github.com';
  this.token = token;
  this.api = Octokit.new({
    token: token
  });
  
  this.headers = function () {
    return {
      'Authorization': 'Bearer ' + token,
      'User-Agent': 'Node'
    };
  }
};

Github.prototype.getUserByUsername = function (username, done) {
  this.api.getUser(username).getInfo().then(function (user) {
    done(null, user);
  }, done);
};

Github.prototype.getUserByAccessToken = function (done) {
  request({
    url: this.host + '/user',
    method: 'GET',
    headers: this.headers()
  }, function (err, response, body) {
    done(err, JSON.parse(body));
  });
};

Github.prototype.createGist = function (options, done) {
  request({
    url: this.host + '/gists',
    method: 'POST',
    headers: this.headers(),
    body: JSON.stringify(options)
  }, function (err, response, body) {
    done(err, JSON.parse(body));
  });
};