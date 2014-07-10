var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var shortId = require('shortid');
var is = require('is');
var semver = require('semver');
var compareSemver = require('compare-semver');
var slug = require('cozy-slug');
var randomName = require('yay');
var Version = require('./version');
var Github = require('./github');
var Schema = mongoose.Schema;

var Package = new Schema({
  _id: {type: String, unique: true, default: shortId.generate},
  user_id: {type: String, default: null},
  name: {type: String, default: null, index: true},
  gist_id: {type: String, default: null},
  versions: {type: [Version.schema], default: []},
  files: {type: Schema.Types.Mixed, default: []}
}, {
  'collection': 'packages',
  '_id': false,
  'versionKey': false
});

// Instance methods

Package.methods.latestVersion = function () {
  var versionNumbers = _(this.versions)
    .filter(function (version) {
      // Ignore yanked versions
      return !version.yanked;
    })
    .pluck('number')
    .value();
  
  return compareSemver.max(versionNumbers);
};

Package.methods.saveIfValid = function (done) {
  var package = this;
  
  PackageModel.isNameUnique(package.id, package.name, package.user_id, function (err, isUnique) {
    if (err) return done(err);
    if (!isUnique) return done(null, false);
    
    package.save(function (err) {
      if (err) return done(err);
      done(err, true);
    });
  });
};

Package.methods.updateFilenamesWithPackageName = function (oldFilename) {
  var package = this;
  var packageName = this.name;
  
  if (packageName === oldFilename) return package;
  if (!package.files.length) return package;
  
  package.files = _.map(package.files, function (file) {
    var ext = path.extname(file.name);
    var truncFilename = path.basename(file.name, ext);
    
    if (truncFilename === oldFilename) file.name = packageName + ext;
    
    return file;
  });
  
  package.markModified('files');
  
  return package;
};

Package.methods.setFileContent = function (filename, content) {
  var existing = _.find(this.files, {name: filename});
  
  if (!existing) {
    this.files.push({
      name: filename,
      content: content
    });
  }
  else {
    existing.content = content;
  }
  
  this.markModified('files');
  
  return this;
};

Package.methods.toResponse = function() {
  return {
    id: this._id,
    name: this.name,
    gist_id: this.gist_id,
    files: parseFileList(this.files),
    versions: this.versions
  };
};

// Static methods

Package.statics.findForUserId = function (userId, done) {
  this.find({user_id: userId}, function (err, packages) {
    if (err) return done(err);
    
    var sortedPackages = _(packages)
      .map(function (package) {
        var latestNumber = package.latestVersion();
        var latestReleaseDate;
        
        if (latestNumber) {
          latestReleaseDate = _.find(package.versions, {number: latestNumber}).created_at;
        }
        
        return {
          name: package.name,
          id: package._id,
          version: latestNumber,
          released_at: latestReleaseDate
        };
      })
      .sortBy('name')
      .value();
    
    done(err, sortedPackages);
  });
};

Package.statics.findByIdOrName = function (packageId, userId, done, raw) {
  this.findOne({
    '$or': [
      {_id: packageId},
      {name: packageId}
    ],
    '$and': [
      {user_id: userId}
    ]
  }, done);
};

Package.statics.findFileContentsByPackageIdOrName = function (filename, packageId, userId, done) {
  PackageModel.findByIdOrName(packageId, userId, function (err, package) {
    if (err) return done(err);
    if (!package) return done({noPackage: true});
    
    done(null, package.toResponse().files[filename]);
  });
};

Package.statics.findFileContentsFromVersion = function (options, done) {
  if (options.number === 'dev') {
    return PackageModel.findFileContentsByPackageIdOrName(
      options.filename,
      options.packageId,
      options.userId,
      done
    );
  }
  
  PackageModel.getVersion(options, function (err, version, package) {
    if (err) return done(err);
    if (!version) return done();
    if (!package || !package.gist_id) return done();
    
    var gh = new Github(options.accessToken);
    var gistId = package.gist_id;
    var sha = version.sha;
    
    gh.getGistFileContentsForCommit(gistId, sha, function (err, files) {
      if (err) return done(err);
      if (!files || !files[options.filename]) return done();
      
      done(null, files[options.filename].content);
    });
  });
};

Package.statics.getVersion = function (options, done) {
  PackageModel.findByIdOrName(options.packageId, options.userId, function (err, package) {
    if (!package) return done(err, null, null);
    
    var where = {
      number: options.number,
      yanked: false
    };
    
    if (options.number === 'latest') where.number = package.latestVersion();
    
    done(err, _.find(package.versions, where), package);
  });
};

Package.statics.updateByIdOrName = function(options, done) {
  var packageId = options.packageId;
  var userId = options.userId;
  var data = options.data;
  
  PackageModel.findByIdOrName(packageId, userId, function (err, package) {
    if (!package) return done();
    
    var originalName = package.name;
    
    // Set default Polymer file contents
    if (data.source) package.setFileContent(package.name + '.html', data.source);
    if (data.demo) package.setFileContent('demo.html', data.demo);
    
    _.extend(package, _.omit(data, ['source', 'demo']));
    
    // Rename any file that has the same name as the package
    // (so they match, like best friends)
    package
      .updateFilenamesWithPackageName(originalName)
      .saveIfValid(function (err, saved) {
        done(err, saved, package);
      });
  }, true);
};

Package.statics.updateFileContents = function (options, done) {
  PackageModel.findByIdOrName(options.packageId, options.userId, function (err, package) {
    package.files = _.map(package.files, function (file, idx) {
      if (file.name === options.filename) file.content = options.content;
      return file;
    });
    
    package.markModified('files');
    package.save(done);
  }, true);
};

Package.statics.isVersionUniqueAndGreatest = function (options, done) {
  
  // NOTE: this might be a bottle neck as the versions list grows
  // QUESTION: Should we cache the latest version number as a value on the package object?
  
  PackageModel.findByIdOrName(options.packageId, options.userId, function (err, package) {
    var versions = package.versions;
    var versionNumber = options.number;
    
    done(
      err,
      compareSemver.unique(versionNumber, _.pluck(versions, 'number')),
      compareSemver.gt(versionNumber, _.pluck(versions, 'number')),
      package
    );
  }, true);
};

Package.statics.isNameUnique = function (packageId, name, userId, done) {
  if (!name) return done(null, true);
  
  PackageModel.findByIdOrName(name, userId, function (err, package) {
    if (err) return done(err);
    if (package && package._id !== packageId) return done(null, false); // if the name matches the current package, don't do this
    
    done(null, true);
  }, true);
};

Package.statics.nameToSlug = function (str) {
  return str ? slug(str) : null;
};

Package.statics.yankVersion = function (options, done) {
  PackageModel.findByIdOrName(options.packageId, options.userId, function (err, package) {
    var alreadyYanked = false;
    
    package.versions = _.map(package.versions, function (version) {
      if (version.number === options.number) {
        if (version.yanked) alreadyYanked = true;
        version.yanked = true;
      }
      return version;
    });
    
    if (alreadyYanked) return done({alreadyYanked: true});
    
    package.markModified('versions');
    package.save(done);
  });
};

Package.statics.filesFromObjectToArray = function (files) {
  var _filesList = [];
  
  Object.keys(files).forEach(function (filename) {
    _filesList.push({
      name: filename,
      content: files[filename]
    });
  });
  
  return _filesList;
};

Package.statics.parseFilelistForGist = function (files) {
  return _(files)
    .map(function (file) {
      return [file.name, {content: file.content}];
    })
    .zipObject()
    .value();
};

Package.pre('save', function formatFileList (next) {
  if (is.object(this.files)) this.files = PackageModel.filesFromObjectToArray(this.files);
  next();
});

Package.pre('save', function ensureName (next) {
  if (!this.name || this.name.length === 0) this.name = randomName();
  if (this.files.length === 0) this.files = defaultFiles(this);
  next();
});

Package.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

var PackageModel = module.exports = mongoose.model('Package', Package);

function parseFileList (packageFiles) {
  var files = {};
  
  packageFiles.forEach(function (file) {
    files[file.name] = file.content;
  });
  
  return files;
}

var defaultSource = fs.readFileSync(__dirname + '/../../templates/default-source.html').toString();
var defaultDemo = fs.readFileSync(__dirname + '/../../templates/default-demo.html').toString();
function defaultFiles(package) {
  return [
    {name: package.name + ".html", content: defaultSource.replace(/{ELEMENT_NAME}/g, package.name)},
    {name: 'demo.html', content: defaultDemo.replace(/{ELEMENT_NAME}/g, package.name)}
  ];
}