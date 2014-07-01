var winston = require('winston');
require('winston-papertrail').Papertrail;

var transports = [];

transports.push(consoleTransport());

// if (options.console) transports.push(consoleTransport());
// if (options.hosted) transports.push(papertrailTransport());

function consoleTransport () {
  return new (winston.transports.Console)();
}

var logger = module.exports = new winston.Logger({ transports: transports });

logger.network = function () {
  return function (req, res, next) {
    var output = [];
    var start = new Date().getTime();
    var end;
    
    output.push((req.connection && req.connection.remoteAddress) || 'localhost');
    output.push('- [' + new Date() + '] -');
    
    function logRequest () {
      output.push('[REQUEST: ' + req.method + ' ' + req.url + ']');
      output.push('[RESPONSE: status code ' + res.statusCode + ' in ' + (new Date().getTime() - start) + 'ms ]');
      logger.info(output.join(' '));
    }
    
    res.on('finish', logRequest);
    res.on('close', logRequest);
    
    next();
  };
};

// function papertrailTransport () {
//   return new winston.transports.Papertrail({
//     host: process.env.PAPERTRAIL_HOST || options.host || 'logs.papertrailapp.com',
//     port: process.env.PAPERTRAIL_PORT || options.port ||  77777,
//     logFormat: function(level, message) {
//       return prefix + ': [' + level + '] ' + message;
//     },
//     colorize: options.colorize
//   })
// }