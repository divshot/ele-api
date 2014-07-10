var Package = require('../models/package');
var User = require('../models/user');
var mime = require('mime-types');
var express = require('express');

module.exports = function (imports) {
  var app = imports.app;
  var auth = imports.auth;
  
  app.get('/:username/:package/:file', function (req, res) {
    User.findByParam(req.params.username, function(err, user) {
      if (!user) return res.boom.notFound('User does not exist');
      
      var packageId = req.params.package;
      var filename = req.params.file;

      Package.findFileContentsByPackageIdOrName(
        filename,
        packageId,
        user.github_id,
        function (err, content) {
          if (err || !content) return res.boom.notFound('File does not exist');

          res.set('Content-Type', mime.lookup(filename));
          res.send(content);
        }
      );
    });
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
        if (err || !package) return res.boom.notFound('Package does not exist');
        res.send(package);
      });
    }
  );
  
  // Serve static core files
  app.use('/:user/:pkg', express.static(__dirname + '/../../vendor'));
};