var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var shortId = require('shortid');
var Schema = mongoose.Schema;
var is = require('is');
var _ = require('lodash');
var Version = require('./version');
var semver = require('semver');

var Package = new Schema({
  _id: {type: String, unique: true, default: shortId.generate},
  user_id: {type: String, default: null},
  name: {type: String, default: null},
  gist_id: {type: String, default: null},
  versions: {type: [Version.schema], default: []},
  files: {type: Schema.Types.Mixed, default: []}
}, {
  'collection': 'packages',
  '_id': false,
  'versionKey': false
});

// Static methods

Package.statics.findByIdOrName = function (packageId, userId, done, raw) {
  this.findOne({
    '$or': [
      {_id: packageId},
      {name: packageId}
    ],
    '$and': [
      {user_id: userId}
    ]
  }, function (err, package) {
    // Convert file list in file hash
    if (package && !raw) package.files = parseFileList(package.files);
    
    done(err, package);
  });
};

Package.statics.findFileContentsByPackageIdOrName = function (filename, packageId, userId, done) {
  PackageModel.findByIdOrName(packageId, userId, function (err, package) {
    if (err) return done(err);
    if (!package) return done();
    
    done(null, package.files[filename]);
  });
};

Package.statics.getVersion = function (options, done) {
  PackageModel.findByIdOrName(options.packageId, options.userId, function (err, package) {
    if (!package) return done(err, null, null);
    
    var where = {
      number: options.number,
      yanked: false
    };
    
    done(err, _.find(package.versions, where), package);
  });
};

Package.statics.updateFileContents = function (options, done) {
  PackageModel.findByIdOrName(options.packageId, options.userId, function (err, package) {
    package.files = _.map(package.files, function (file, idx) {
      if (file.name == options.filename) file.content = options.content;
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
      isUnique(versionNumber, versions),
      isGreatest(versionNumber, versions),
      package
    );
    
    function isUnique (number, versions) {
      return !_.find(versions, {number: number});
    }
    
    function isGreatest (number, versions) {
      return !_.find(versions, function (version) {
        return semver.lt(versionNumber, version.number);
      });
    }
  }, true);
};

Package.statics.yankVersion = function (options, done) {
  PackageModel.findByIdOrName(options.packageId, options.userId, function (err, package) {
    var alreadyYanked = false;
    
    package.files = _.map(package.versions, function (version) {
      if (version.number === options.number) {
        if (version.yanked) alreadyYanked = true;
        version.yanked = true;
      }
      return version;
    });
    
    if (alreadyYanked) return done({alreadyYanked: true});
    
    package.markModified('files');
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

// Force correct storage of file list
Package.pre('save', function (next) {
  if (is.object(this.files)) {
    this.files = PackageModel.filesFromObjectToArray(this.files);
  }
  
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