var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;

var User = new Schema({
  github_id: {type: String, index: true},
  name: String,
  username: {type: String, index: true},
  access_token: {type: String, default: null}
}, {
  'collection': 'users',
  'versionKey': false
});

User.statics.findByParam = function (param, done) {
  UserModel.findOne({"$or":[
    {username: param},
    {github_id:param}
  ]}, done);
};

User.plugin(findOrCreate);

var UserModel = module.exports = mongoose.model('User', User);