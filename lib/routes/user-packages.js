module.exports = function (imports) {
  var app = imports.app;
  var auth = imports.auth;
  
  // app.param('username', function (req, res, next, username) {
  //   console.log(req.user.token);
  //   next();
  // });
  
  app.get('/:username/:package', function (req, res) {
    res.send('username');
  });
  
  app.get('/:username/:package/:version/:file', function (req, res) {
    res.send('version package file');
  });
  
  app.post('/:username/:package/releases/:version',
    auth.authorize(),
    function (req, res) {
      res.send('version package file');
    }
  );
  
  app.get('/:username/:package/:file', function (req, res) {
    res.send('package file');
  });
  
  app.put('/:username/:package/:file',
    auth.authorize(),
    function (req ,res) {
      res.send();
    }
  );
  
  app.delete('/:username/:package/:version',
    auth.authorize(),
    function (req ,res) {
      res.send();
    }
  );
};