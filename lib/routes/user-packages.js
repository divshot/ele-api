var Github = require('../models/github');
var User = require('../models/user');
var Package = require('../models/package');

module.exports = function (imports) {
  var app = imports.app;
  var auth = imports.auth;
  
  app.param('username', function (req, res, next, username) {
    User.findByParam(username, function (err, user) {
      if (user) {
        req.meta.user = user;
        return next();
      }
      
      // TODO: if there is no user or token, respond with an error
      // Also try using req.headers.authorize for the token
      
      var gh = new Github(req.user.access_token);
      
      gh.getUserByUsername(username, function (err, user) {
        if (err) return res.send(404);
        user.github_id = user.id;
        req.meta.user = user;
        next();
      });
    });
  });
  
  app.get('/:username/:package', function (req, res) {
    var user = req.meta.user;
    
    Package.findByIdOrName(req.params.package, user.github_id, function (err, package) {
      if (err) return res.send(500, {error: err.message});
      if (!package) return res.send(404);
      
      res.send(package);
    });
  });
};