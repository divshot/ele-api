var Package = require('../models/package');
var Github = require('../models/github');
var logger = require('../logger');

module.exports = function (imports) {
  var app = imports.app;
  
  app.post('/packages', function (req ,res) {
    var user = req.user;
    var bodyFiles = req.body.files || {};
    var name = (req.body.name) ? Package.nameToSlug(req.body.name) : undefined;
    
    var package = new Package({
      name: name,
      files: bodyFiles,
      user_id: (req.user) ? req.user.github_id : undefined
    });
    
    package.saveIfValid(function (err, saved) {
      if (err) {
        logger.error(err.message);
        logger.error(err.stack);
        return res.boom.badImplementation(err);
      }
      
      if (!saved) return res.boom.notFound('Package not saved');
      res.send(package.toResponse());
    });
  });
};