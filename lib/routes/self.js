var omit = require('lodash').omit;

module.exports = function (imports) {
  var app = imports.app;
  
  app.get('/self', function (req, res) {
    if (!req.user) return res.send(401);
    var user = omit(req.user, 'access_token');
    res.send(user);
  });
};