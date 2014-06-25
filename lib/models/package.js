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

Package.statics.findByIdOrName = function (packageId, userId, done) {
  this.findOne({
    '$or': [
      {_id: packageId},
      {name: packageId}
    ],
    '$and': [
      {user_id: userId}
    ]
  }, function (err, package) {
    var files = {};
    
    // Convert file list in file hash
    if (package) {
      package.files.forEach(function (file) {
        files[file.name] = file.content;
      });
      package.files = files;
    }
    
    done(err, package);
  });
};

Package.statics.findFileContentsByPackageByIdOrName = function (filename, packageId, userId, done) {
  PackageModel.findByIdOrName(packageId, userId, function (err, package) {
    if (err) return done(err);
    if (!package) return done();
    
    done(null, package.files[filename]);
  });
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