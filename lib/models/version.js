var mongoose = require('mongoose');
var semver = require('semver');
var Schema = mongoose.Schema;

var Version = new Schema({
  number: {type: String, unique: true},
  sha: String,
  created_at: {type: Date, default: Date.now},
  yanked: {type: Boolean, default: false}
}, {
  '_id': false,
  'id': false
});

Version.statics.isValid = function (number) {
  return semver.valid(number);
};

var VersionModel = module.exports = mongoose.model('Version', Version);

VersionModel.schema = Version;