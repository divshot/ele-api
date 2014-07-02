var _ = require('lodash');
var Package = require('../models/package');

module.exports = function (imports) {
  var app = imports.app;
  
  app.get('/self', function (req, res) {
    if (!req.user) return res.boom.unauthorized();
    
    var user = _.omit(req.user, 'access_token');
    
    Package.findForUserId(user.github_id, function (err, packages) {
      user.packages = packages;
      res.send(user);
    });
  });
};