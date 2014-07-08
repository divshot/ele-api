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
      
      var token = (req.user) ? req.user.access_token : undefined;
      var gh = new Github(token);
      
      gh.getUserByUsername(username, function (err, user) {
        if (err) return res.boom.notFound('Github user does not exist');
        
        user.github_id = user.id;
        req.context.user = user;
        next();
      });
    });
  });
  
  app.get('/:username/:package',
    findPackageByIdOrName(Package),
    function (req, res) {
      res.send(req.context.package.toResponse());
    }
  );
  
  app.put('/:username/:package',
    auth.authorize(),
    currentUserPackage(),
    function (req, res) {
      var user = req.context.user;
      var packageId = req.params.package;
      
      Package.updateByIdOrName({
        packageId: packageId,
        userId: user.github_id,
        data: req.body
      }, function (err, saved, package) {
        if (err) return res.boom.badImplementation(err.message);
        if (!package) return res.boom.notFound('Package does not exist');
        if (!saved) return res.boom.badRequest('Package not saved');
        
        res.send(package.toResponse());
      });
    }
  );
  
  app.delete('/:username/:package',
    auth.authorize(),
    currentUserPackage(),
    findPackageByIdOrName(Package),
    function (req, res) {
      req.context.package.remove(function (err) {
        if (err) return res.boom.badImplementation(err.message);
        res.send();
      });
    }
  );
  
};