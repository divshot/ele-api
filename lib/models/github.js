var _ = require('lodash');
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

Github.latestGistVersion = function (gist) {
  return _(gist.history)
    .sortBy(function (commit) {
      return new Date(commit.committed_at).getTime();
    })
    .last()
    .version;
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

Github.prototype.createGist = function (body, done) {
  request({
    url: this.host + '/gists',
    method: 'POST',
    headers: this.headers(),
    body: JSON.stringify(body)
  }, function (err, response, body) {
    done(err, JSON.parse(body));
  });
};

Github.prototype.updateGist = function (id, body, done) {
  request({
    url: this.host + '/gists/' + id,
    method: 'PATCH',
    headers: this.headers(),
    body: JSON.stringify(body)
  }, function (err, response, body) {
    done(err, JSON.parse(body));
  });
};

Github.prototype.getGistFileContentsForCommit = function (gistId, sha, done) {
  request({
    url: this.host + '/gists/' + gistId + '/' + sha,
    method: 'GET',
    headers: this.headers()
  }, function (err, response, body) {
    var files = (body) ? JSON.parse(body).files : undefined;
    done(err, files);
  });
};