var User = require('../models/user');
var Github = require('../models/github');

module.exports = function () {
  return function (req, res, next) {
    if (!req.headers.authorization) return next();
    
    var accessToken = req.headers.authorization.split(' ')[1];
    
    User.findOne({access_token: accessToken}, function (err, user) {
      if (err) return next(err);
      
      if (user) {
        req.user = user;
        next();
      }
      else {
        var gh = req.gh = new Github(accessToken);
        gh.getUserByAccessToken(function (err, user) {
          if (err) return next(err);
          
          user.access_token = accessToken;
          user.github_id = user.id + '';
          user.username = user.login;
          req.user = user;
          
          next();
        });
      }
    });
  };
};