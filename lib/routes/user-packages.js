var Github = require('../models/github');
var User = require('../models/user');
var Package = require('../models/package');
var mime = require('mime-types');

module.exports = function (imports) {
  var app = imports.app;
  var auth = imports.auth;
  
  app.param('username', function (req, res, next, username) {
    User.findByUsername(username, function (err, user) {
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
  
  // app.get('/:username/:package/:version/:file', function (req, res) {
  //   res.send('version package file');
  // });
  
  // app.post('/:username/:package/releases/:version',
  //   auth.authorize(),
  //   function (req, res) {
  //     res.send('version package file');
  //   }
  // );
  
  app.get('/:username/:package/:file', function (req, res) {
    var user = req.meta.user;
    var packageId = req.params.package;
    var filename = req.params.file;
    
    Package.findFileContentsByPackageIdOrName(
      filename,
      packageId,
      user.github_id,
      function (err, content) {
        if (err || !content) return res.send(404);
        res.set('Content-Type', mime.lookup(filename));
        res.send(content);
      }
    );
  });
  
  app.put(
    '/:username/:package/:file',
    auth.authorize(),
    function (req ,res) {
      var user = req.meta.user;
      var packageId = req.params.package;
      var filename = req.params.file;
      var content = req.body.content;
      
      Package.updateFileContents({
        userId: user.github_id,
        packageId: packageId,
        filename: filename,
        content: content
      }, function (err, package) {
        if (err || !package) return res.send(404);
        res.send(package);
      });
    }
  );
  
  // app.delete('/:username/:package/:version',
  //   auth.authorize(),
  //   function (req ,res) {
  //     res.send();
  //   }
  // );
};