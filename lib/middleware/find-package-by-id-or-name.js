module.exports = function (imports) {
  imports = imports || {};
  
  var Package = imports.Package;
  
  return function (req, res, next) {
    var user = req.context.user;
    var packageId = req.params.package;
    
    Package.findByIdOrName(packageId, user.github_id, function (err, package) {
      if (err) return res.withError(err);
      if (!package) return res.boom.notFound('Package does not exist');
      
      req.context.package = package;
      
      next();
    });
  };
};