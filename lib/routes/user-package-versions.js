var _ = require('lodash');
var Package = require('../models/package');
var Github = require('../models/github');
var Version = require('../models/version');

module.exports = function (imports) {
  var app = imports.app;
  var auth = imports.auth;
  
  // app.get('/:username/:package/:version/:file', function (req, res) {
  //   res.send('version package file');
  // });


  /*
    x validate semver
    x ensure semver is larger than all others
      - if the same as another, return 409
      - if there is a version higher than this number, return 400
    * update/create gist
    - add version entry to package
   */
  
  app.post('/:username/:package/releases/:version',
    auth.authorize(),
    function (req, res) {
      var user = req.meta.user;
      var packageId = req.params.package;
      var versionNumber = req.params.version;
      
      if (!Version.isValid(versionNumber)) return res.send(400, 'Invalid version number');
      
      Package.isVersionUniqueAndGreatest({
        packageId: packageId,
        userId: user.github_id,
        number: versionNumber
      }, function (err, unique, greatest, package) {
        if (!package) return res.send(404);
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
          
        }
        
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
      });
    }
  );
  
  // app.delete('/:username/:package/:version',
  //   auth.authorize(),
  //   function (req ,res) {
  //     res.send();
  //   }
  // );
  
};