var _ = require('lodash');
var Package = require('../models/package');
var Github = require('../models/github');
var Version = require('../models/version');
var mime = require('mime-types');

module.exports = function (imports) {
  var app = imports.app;
  var auth = imports.auth;
  
  app.get('/:username/:package/:version/:file', function (req, res) {
    var user = req.context.user;
    var packageId = req.params.package;
    var versionNumber = req.params.version;
    var filename = req.params.file;
    
    Package.findFileContentsFromVersion({
      userId: user.github_id,
      packageId: packageId,
      number: versionNumber,
      filename: filename,
      accessToken: req.user.access_token
    }, function (err, content) {
      if (err) return res.send(500, err.message);
      if (!content) return res.send(404);
      
      res.set('Content-Type', mime.lookup(filename));
      res.send(content);
    });
  });

  app.post('/:username/:package/releases/:version',
    auth.authorize(),
    function (req, res) {
      var user = req.context.user;
      var packageId = req.params.package;
      var versionNumber = req.params.version;
      
      if (!Version.isValid(versionNumber)) return res.send(400, 'Invalid version number');
      
      // TODO: move all this to Package model?
      
      Package.isVersionUniqueAndGreatest({
        packageId: packageId,
        userId: user.github_id,
        number: versionNumber
      }, function (err, unique, greatest, package) {
        if (!package) return res.send(404, 'Package does not exist');
        if (!unique) return res.send(409, 'Version is a duplicate');
        if (!greatest) return res.send(400, 'Version is less than latest');
        
        var gh = new Github(req.user.access_token);
        var files = Package.parseFilelistForGist(package.files);
        
        // Create gist
        if (!package.gist_id) {
          gh.createGist({
            description: package.name,
            public: true,
            files: files
          }, function (err, gist) {
            if (err) return res.send(500, err.message);
            package.gist_id = gist.id;
            attachGistToNewVersion(package, versionNumber, gist);
          });
        }
        
        // Update gist
        else {
          gh.updateGist(package.gist_id, {
            description: package.name,
            public: true,
            files: files
          }, function (err, gist) {
            
            // TODO: if gist is null, create a new one
            
            if (err) return res.send(500, err.message);
            attachGistToNewVersion(package, versionNumber, gist);
          });
        }
      });
      
      // Create version
      function attachGistToNewVersion (package, packageVersionNumber, gist) {
        var version = new Version({
          number: versionNumber,
          sha: Github.latestGistVersion(gist)
        });
        
        package.versions.push(version);
        package.save(function (err) {
          if (err) return res.send(500, err.message);
          
          res.send({
            version: version.number,
            gist_url: gist.url,
            git_url: gist.git_pull_url,
            created_at: version.created_at
          });
        });
      }
    }
  );
  
  app.delete('/:username/:package/:version',
    auth.authorize(),
    function (req ,res) {
      var user = req.context.user;
      var packageId = req.params.package;
      var versionNumber = req.params.version;
      
      Package.yankVersion({
        userId: user.github_id,
        packageId: packageId,
        number: versionNumber
      }, function (err, package) {
        if (err && err.alreadyYanked) return res.send(304);
        if (err) return res.send(500, err.message);
        if (!package) return res.send(404, 'Package does not exist');
        
        res.send();
      });
    }
  );
  
};