module.exports = function (imports) {
  var app = imports.app;
  
  app.get('/packages', function (req ,res) {
    res.send('packages');
  });
};