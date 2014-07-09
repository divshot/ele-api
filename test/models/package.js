require('mockgoose')(require('mongoose'));

var expect = require('chai').expect;
var Package = require('../../lib/models/package');

describe('model: Package', function () {
  describe('new Package(data)', function () {
    it('sets default values', function () {
      var package = new Package();
      expect(package._id).to.not.equal(undefined);
      expect(package.user_id).to.equal(null);
      expect(package.name).to.equal(null);
      expect(package.gist_id).to.equal(null);
      expect(package.versions).to.be.an('array');
      expect(package.files).to.be.an('array');
    });
    
    it('sets the collection name', function () {
      expect(Package.collection.name).to.equal('packages');
    });
    
    it('removes version key', function (done) {
      var package = new Package({name: 'package'});
      package.save(function () {
        expect(package.__v).to.equal(undefined);
        done();
      });
    });
    
    describe('.latestVersion()', function () {
      
    });
    
    describe('.saveIfValid(callback)', function () {
      
    });
    
    describe('.updateFilenamesWithPackageName(name)', function () {
      
    });
    
    describe('.setFileContent(filename, content)', function () {
      
    });
    
    describe('.toResponse()', function () {
      
    });
  });

  describe('Package', function () {
    describe('.findForUserId(userId, callback)', function () {
      
    });
    
    describe('.findByIdOrName(packageId, userId, callback, raw)', function () {
      
    });
    
    describe('.findFileContentsByPackageIdOrName(filename, packageId, userId, callback)', function () {
      
    });
    
    describe('.findFileContentsFromVersion(options, callback)', function () {
      
    });
    
    describe('.getVersion(options, callback)', function () {
      
    });
    
    describe('.updateByIdOrName(options, callback)', function () {
      
    });
    
    describe('.updateFileContents(options, callback)', function () {
      
    });
    
    describe('.isVersionUniqueAndGreatest(options, callback)', function () {
      
    });
    
    describe('.isNameUnique(packageId, name, userId, callback)', function () {
      
    });
    
    describe('.nameToSlug(name)', function () {
      
    });
    
    describe('.yankVersion(options, callback)', function () {
      
    });
    
    describe('.fielsFromObjectToArray(files)', function () {
      
    });
    
    describe('.parseFileListForGist(files)', function () {
      
    });
  });

  describe('pre save hook', function () {
    
  });
  
  describe('plugins', function () {
    describe('timestamps', function () {
      
    });
  });
});