require('mockgoose')(require('mongoose'));

var expect = require('chai').expect;
var Version = require('../../lib/models/version');

describe('model: Version', function () {
  describe('schema', function () {
    it('types', function (done) {
      var version = new Version({
        number: '0.2.0',
        sha: '1234567890'
      });
      
      version.save(function () {
        expect(version.number).to.equal('0.2.0');
        expect(version.sha).to.equal('1234567890');
        expect(version.created_at).to.not.equal(undefined);
        expect(version.yanked).to.equal(false);
        version.remove(done);
      });
    });
    
    it('does not save an _id', function (done) {
      version = new Version();
      version.save(function () {
        expect(version._id).to.equal(undefined);
        version.remove(done);
      });
    });
    
    it('does not save an id', function (done) {
      version = new Version();
      version.save(function () {
        expect(version.id).to.equal(undefined);
        version.remove(done);
      });
    });
  });
  
  describe('.isValid(versionNubmer)', function () {
    it('validates a semver number', function () {
      expect(!!Version.isValid('0.2.0')).to.equal(true);
      expect(!!Version.isValid('a.b.c')).to.equal(false);
    });
  });
});