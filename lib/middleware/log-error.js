var logger = require('../logger');

module.exports = function (options) {
  options = options || {};
  
  return function (req, res, next) {
    req.logError = function (err) {
      if (options.testMode) return;
      
      // TODO: use a custom transport for Winston here instead
      
      var log = (options.output)
        ? options.output.logs.push.bind(options.output.logs)
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