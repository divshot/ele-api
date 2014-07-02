var Package = require('../models/package');

module.exports = function () {
  return function (req, res, next) {
    var user = req.context.user;
    var packageId = req.params.package;
    
    Package.findByIdOrName(packageId, user.github_id, function (err, package) {
      if (err) return res.boom.badImplementation(err.message);
      if (!package) return res.boom.notFound('Package does not exist');
      
      req.context.package = package;
      
      next();
    });
  };
};