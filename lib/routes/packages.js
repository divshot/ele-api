var Package = require('../models/package');
var Github = require('../models/github');

module.exports = function (imports) {
  var app = imports.app;
  
  app.post('/packages', function (req ,res) {
    var user = req.user;
    var bodyFiles = req.body.files || {};
    if (req.body.name) { var name = Package.nameToSlug(req.body.name); }
    var package = new Package({
      name: name,
      files: bodyFiles,
      user_id: (req.user) ? req.user.github_id : undefined
    });
    
    package.saveIfValid(function (err, saved) {
      console.log(err);
      if (err) return res.boom.badImplementation(err);
      if (!saved) return res.boom.notFound('Package not saved');
      res.send(package.toResponse());
    });
  });
};