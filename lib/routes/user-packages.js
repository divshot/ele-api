var Github = require('../models/github');
var User = require('../models/user');
var Package = require('../models/package');
var currentUserPackage = require('../middleware/current-user-package');
var findPackageByIdOrName = require('../middleware/find-package-by-id-or-name');

module.exports = function (imports) {
  var app = imports.app;
  var auth = imports.auth;
  
  app.param('username', function (req, res, next, username) {
    User.findByParam(username, function (err, user) {
      if (user) {
        req.context.user = user;
        return next();
      }
      
      // TODO: if there is no user or token, respond with an error
      // Also try using req.headers.authorize for the token
      
      var token = (req.user) ? req.user.access_token : undefined;
      var gh = new Github(token);
      
      gh.getUserByUsername(username, function (err, user) {
        if (err) return res.send(404);
        
        user.github_id = user.id;
        req.context.user = user;
        next();
      });
    });
  });
  
  app.get('/:username/:package',
    findPackageByIdOrName(),
    function (req, res) {
      res.send(req.context.package);
    }
  );
  
  app.put('/:username/:package',
    auth.authorize(),
    currentUserPackage(),
    function (req, res) {
      var user = req.context.user;
      var name = req.body.name;
      var packageId = req.params.package;
      
      Package.updateByIdOrName({
        packageId: packageId,
        userId: user.github_id,
        data: {
          name: name
        }
      }, function (err, saved, package) {
        if (err) return res.send(500, err.message);
        if (!package) return res.send(404);
        if (!saved) return res.send(400);
        
        res.send(package);
      });
    }
  );
  
  app.delete('/:username/:package',
    auth.authorize(),
    currentUserPackage(),
    findPackageByIdOrName(),
    function (req, res) {
      req.context.package.remove(function () {
        if (err) return res.send(500, err.message);
        res.send();
      });
    }
  );
  
};