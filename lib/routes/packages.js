var Package = require('../models/package');
var Github = require('../models/github');

module.exports = function (imports) {
  var app = imports.app;
  
  app.post('/packages', function (req ,res) {
    var user = req.user;
    var bodyFiles = req.body.files || {};
    var name = req.body.name;
    var package = new Package({
      name: name,
      files: bodyFiles,
      user_id: (req.user) ? req.user.github_id : undefined
    });
    
    // TODO: if package has same name as one the user
    // has already created, return error
    
    package.save(function (err) {
      Package.findByIdOrName(package.name, user.github_id, function (err, package) {
        if (err) return res.send(500, err.message);
        
        res.send(package);
      });
    });
  });
};