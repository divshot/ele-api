module.exports = function(app) {
  var githubOAuth = require('github-oauth')({
    githubClient: process.env['GITHUB_KEY'],
    githubSecret: process.env['GITHUB_SECRET'],
    baseURL: process.env['ORIGIN'],
    loginURI: '/auth',
    callbackURI: '/auth/callback',
    scope: 'gist' // optional, default scope is set to user
  });

  app.get('/auth', githubOAuth.login);
  app.get('/auth/callback', function(req, res) {
    githubOAuth.callback(req, res);
  });
  
  return githubOAuth;
};
