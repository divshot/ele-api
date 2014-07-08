
module.exports = function (imports) {
  imports = imports || {};
  
  var logger = imports.logger;
  
  return function (req, res, next) {
    req.logError = function (err) {
      if (imports.testMode) return;
      
      // TODO: use a custom transport for Winston here instead OR
      // logger object passed in should handle whether it should print
      // or not
      
      var log = (imports.output)
        ? imports.output.logs.push.bind(imports.output.logs)
        : logger.error.bind(logger);
      
      log(req.url);
      log(err.message);
      log(err.stack);
    };
    
    res.withError = function (err) {
      req.logError(err);
      res.boom.badImplementation(err.message);
    };
    
    next();
  };
};