var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var shortId = require('shortid');
var Schema = mongoose.Schema;
var is = require('is');
var _ = require('lodash');

var Package = new Schema({
  _id: {type: String, unique: true, default: shortId.generate},
  user_id: {type: String, default: null},
  name: {type: String, default: null},
  gist_id: {type: String, default: null},
  versions: {type: [], default: []},
  files: {type: Schema.Types.Mixed, default: []}
}, {
  'collection': 'packages',
  '_id': false,
  'versionKey': false
});

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

// Force correct storage of file list
Package.pre('save', function (next) {
  if (is.object(this.files)) {
    this.files = filesFromObjectToArray(this.files);
  }
  
  next();
});

Package.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

var PackageModel = module.exports = mongoose.model('Package', Package);

function filesFromObjectToArray (files) {
  var _filesList = [];
  
  Object.keys(files).forEach(function (filename) {
    _filesList.push({
      name: filename,
      content: files[filename]
    });
  });
  
  return _filesList;
}

function parseFileList (packageFiles) {
  var files = {};
  
  packageFiles.forEach(function (file) {
    files[file.name] = file.content;
  });
  
  return files;
}