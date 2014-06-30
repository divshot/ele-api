var Package = require('../models/package');

module.exports = function () {
  return function (req, res, next) {
    var user = req.meta.user;
    var packageId = req.params.package;
    
    Package.findByIdOrName(packageId, user.github_id, function (err, package) {
      if (err) return res.send(500, {error: err.message});
      if (!package) return res.send(404);
      
      req.meta.package = package;
      
      next();
    });
  };
};