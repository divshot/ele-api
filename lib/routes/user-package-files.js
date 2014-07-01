var Package = require('../models/package');
var mime = require('mime-types');

module.exports = function (imports) {
  var app = imports.app;
  var auth = imports.auth;
  
  app.get('/:username/:package/:file', function (req, res) {
    var user = req.context.user;
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
      var user = req.context.user;
      var packageId = req.params.package;
      var filename = req.params.file;
      var content = req.body;
      
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
  
};