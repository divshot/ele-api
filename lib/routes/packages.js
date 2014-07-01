var Package = require('../models/package');
var Github = require('../models/github');

module.exports = function (imports) {
  var app = imports.app;
  
  app.post('/packages', function (req ,res) {
    var user = req.user;
    var bodyFiles = req.body.files || {};
    var name = Package.nameToSlug(req.body.name);
    var package = new Package({
      name: name,
      files: bodyFiles,
      user_id: (req.user) ? req.user.github_id : undefined
    });
    
    package.saveIfValid(function (err, saved) {
      if (err) return res.send(500, err.message);
      if (!saved) return res.send(400);
      res.send(package);
    });
  });
};