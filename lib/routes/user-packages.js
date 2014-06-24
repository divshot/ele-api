module.exports = function (imports) {
  var app = imports.app;
  var auth = imports.auth;
  
  app.param('username', function (req, res, next, username) {
    console.log(req.user.token);
    next();
  });
  
  app.get('/:username/:package',
    auth.authorize(),
    function (req, res) {
      res.send('username');
    }
  );
};