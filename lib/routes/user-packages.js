var Github = require('../models/github');
var Package = require('../models/package');
var mime = require('mime-types');

module.exports = function (imports) {
  var app = imports.app;
  var auth = imports.auth;
  
  app.param('username', function (req, res, next, username) {
    // TODO: if there is no user or token, respond with an error
    // Also try using req.headers.authorize for the token
    var gh = new Github(req.user.access_token);
    
    gh.getUserByUsername(username, function (err, user) {
      if (err) return res.send(404);
      req.meta.user = user;
      next();
    });
  });
  
  app.get('/:username/:package', function (req, res) {
    var user = req.meta.user;
    
    Package.findByIdOrName(req.params.package, user.id, function (err, package) {
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
      user.id,
      function (err, contents) {
        res.set('Content-Type', mime.lookup(filename));
        res.send(contents);
      }
    );
  });
  
  // app.put('/:username/:package/:file', function (req ,res) {
  //   var user = req.meta.user;
  //   var packageId = req.params.package;
  //   var filename = req.params.file;
  //   var contents = req.body;
    
  //   res.send();
  // });
  
  // app.delete('/:username/:package/:version',
  //   auth.authorize(),
  //   function (req ,res) {
  //     res.send();
  //   }
  // );
};