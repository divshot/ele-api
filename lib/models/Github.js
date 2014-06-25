var Octokit = require('octokit');

var Github = module.exports = function (token) {
  this.api = Octokit.new({
    token: token
  });
};

Github.prototype.getUserByUsername = function (username, callback) {
  this.api.getUser(username).getInfo().then(function (user) {
    callback(null, user);
  }, callback);
};