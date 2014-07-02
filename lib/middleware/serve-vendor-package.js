var _ = require('lodash');
var fs = require('fs');
var send = require('send');

module.exports = function (dir) {
  return function (req, res, next) {
    
    // Skip ahead because this url isn't serving a core package
    if (req.url.split('/').length < 5) return next();
    
    // NOTE: users path template /:username/:package/{path to core elements}
    
    var filepath = dir + '/' + parseElementName(req.url);
    
    fs.exists(filepath, function (exists) {
      if (!exists) return next();
      send(req, filepath)
        .on('error', skip)
        .on('directory', skip)
        .pipe(res);
    });
    
    function skip () {
      next();
    }
  };
};

function parseElementName (url) {
  return _(url.split('/'))
    .filter(function (item) {
      return item !== '';
    })
    .rest(2)
    .value()
    .join('/');
}