var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var shortId = require('shortid');
var Schema = mongoose.Schema;

var Package = new Schema({
  _id: {type: String, unique: true, default: shortId.generate},
  user_id: {type: String, default: null},
  name: {type: String, default: null},
  gist_id: {type: String, default: null},
  versions: {type: [], default: []},
  files: {type: [], default: []}
}, {
  'collection': 'packages',
  '_id': false,
  'versionKey': false
});

Package.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = mongoose.model('Package', Package);