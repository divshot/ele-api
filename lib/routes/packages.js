var _ = require('lodash');
var Package = require('../models/package');
var Github = require('../models/github');

module.exports = function (imports) {
  var app = imports.app;
  var auth = imports.auth;
  
  app.post('/packages', function (req ,res) {
    // if (req.isAuthenticated()) return res.send(req.user);
    
    // TODO: what if there are no files? Need some authentication
    var files = [];
    var bodyFiles = req.body.files || {};
    var name = req.body.name;
    
    // Escape dot in file name
    Object.keys(bodyFiles).forEach(function (filename) {
      files.push({
        name: filename,
        contnet: bodyFiles[filename]
      });
    });
    
    var package = new Package({
      name: name,
      files: files
    });
    
    package.save(function (err) {
      if (err) return res.send(500, err);
      res.send(package);
    });
    
  });
};