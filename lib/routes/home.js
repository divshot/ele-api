module.exports = function (imports) {
  var app = imports.app;
  
  app.get('/', function (req, res) {
    
    res.boom.notFound();
    
  });
};

