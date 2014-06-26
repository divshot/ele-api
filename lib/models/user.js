var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var findOrCreate = require('mongoose-findorcreate')
var Schema = mongoose.Schema;

var User = new Schema({
  github_id: String,
  name: String,
  username: String,
  access_token: {type: String, default: null}
}, {
  'collection': 'users',
  'versionKey': false
});

User.statics.findByUsername = function (username, done) {
  UserModel.findOne({username: username}, done);
};

User.plugin(findOrCreate);

var UserModel = module.exports = mongoose.model('User', User);