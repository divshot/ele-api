var logger = require('../logger');

module.exports = function () {
  return function (req, res, next) {
    req.logError = function (err) {
      logger.error(req.url);
      logger.error(err.message);
      logger.error(err.stack);
    };
    
    res.withError = function (err) {
      req.logError(err);
      res.boom.badImplementation(err.message);
    };
    
    next();
  };
};