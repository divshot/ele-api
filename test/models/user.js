require('mockgoose')(require('mongoose'));

var expect = require('chai').expect;
var User = require('../../lib/models/user');

describe('model: User', function () {
  describe('schema', function () {
    it('types', function () {
      var user = new User({
        github_id: 1234,
        name: 'name',
        username: 'username',
        access_token: 'token',
        nope: 'nope'
      });
      
      expect(user.github_id).to.equal('1234');
      expect(user.name).to.equal('name');
      expect(user.username).to.equal('username');
      expect(user.access_token).to.equal('token');
      expect(user.nope).to.equal(undefined);
    });
    
    it('sets the collection name', function () {
      expect(User.collection.name).to.equal('users');
    });
    
    it('removes version key', function () {
      expect(User.schema.options.versionKey).to.equal(false);
    });
  });
  
  describe('find by param', function () {
    var u = {
      name: 'person',
      username: 'user1',
      github_id: '1234'
    };
    
    before(function (done) {
      var user = new User(u);
      user.save(done);
    });
    
    it('finds a user by username', function (done) {
      User.findByParam('user1', function (err, user) {
        expect(err).to.equal(null);
        expect(user.username).to.equal('user1');
        expect(user.name).to.equal('person');
        done();
      });
    });
    
    it('finds a user by github_id', function (done) {
      User.findByParam('1234', function (err, user) {
        expect(err).to.equal(null);
        expect(user.github_id).to.equal('1234');
        expect(user.name).to.equal('person');
        done();
      });
    });
  });
  
  describe('plugin: findOrCreate', function () {
    it('finds or creates a document', function () {
      // FIXME: this is a stupid test
      expect(User.findOrCreate).to.be.a('function');
    });
  });
});