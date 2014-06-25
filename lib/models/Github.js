var Octokit = require('octokit');
var request = require('request');

var Github = module.exports = function (token) {
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

Github.prototype.createGist = function (options, done) {
  request({
    url: 'https://api.github.com/gists',
    method: 'POST',
    headers: this.headers(),
    body: JSON.stringify(options)
  }, function (err, response, body) {
    done(err, JSON.parse(body));
  });
};