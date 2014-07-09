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
    
    it('removes version key', function (done) {
      var user = new User({name: 'user'});
      user.save(function () {
        expect(user.__v).to.equal(undefined);
        done();
      });
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
    
    after(function (done) {
      User.findOne({name: 'person'}, function (err, user) {
        user.remove(done);
      });
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
    it('finds a document', function (done) {
      createUser(function () {
        User.findOrCreate({github_id: '54321'}, function (err, user, created) {
          expect(created).to.equal(false);
          expect(user.github_id).to.equal('54321');
          done();
        });
      });
      
      function createUser (done) {
        var user = new User({
          github_id: 54321
        });
        
        user.save(done);
      }
    });
    
    it('creates a document if it does not find it', function (done) {
      User.findOrCreate({github_id: '1234'}, function (err, user, created) {
        expect(created).to.equal(true);
        expect(user.github_id).to.equal('1234');
        expect(user._id).to.not.equal(undefined);
        done();
      });
    });
  });
});