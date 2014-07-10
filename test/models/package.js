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
      it('gets the latest, non-yanked version', function () {
        var package = new Package({
          versions: [
            {
              number: '0.2.0',
              yanked: true
            },
            {
              number: '0.1.0',
              yanked: false
            }
          ]
        });
        expect(package.latestVersion()).to.equal('0.1.0');
      });
    });
    
    describe('.saveIfValid(callback)', function (done) {
      it('rejects saving a package if name is not unique for that user', function (done) {
        var package1 = new Package({
          name: 'nope',
          user_id: '123'
        });
        
        package1.save(function (err) {
          
          var package2 = new Package({
            name: 'nope',
            user_id: '123'
          });
          
          package2.saveIfValid(function (err, saved) {
            expect(saved).to.equal(false);
            package1.remove(done);
          });
        });
      });
      
      it('saves a package if all data is valid', function (done) {
        var package = new Package();
        package.saveIfValid(function (err, saved) {
          expect(saved).to.equal(true);
          if (saved) package.remove(done);
        });
      });
    });
    
    describe('.updateFilenamesWithPackageName(name)', function () {
      it('renames any files that share the the package name', function () {
        var package = new Package({
          files: [
            {
              name: 'some-name.html',
              content:'<some-name></some-name>'
            }
          ]
        });
        
        package.name = 'new-name';
        package.updateFilenamesWithPackageName('some-name');
        
        expect(package.files[0].name).to.equal('new-name.html');
      });
    });
    
    describe('.setFileContent(filename, content)', function () {
      it('sets the content a file by filename', function () {
        var package = new Package({
          name: 'some-name',
          files: [
            {
              name: 'some-name.html',
              content:'<some-name></some-name>'
            }
          ]
        });
        
        package.setFileContent('some-name.html', 'new content');
        expect(package.files[0].content).to.equal('new content');
      });
      
      it('creates a new file if one does not alreayd exist', function () {
        var package = new Package();
        package.setFileContent('some-name.html', 'content');
        expect(package.files[0].content).to.equal('content');
      });
    });
    
    describe('.toResponse()', function () {
      it('formats a package for an http response', function () {
        var package = new Package({name: 'name',});
        var packageKeys = Object.keys(package.toResponse());
        
        expect(packageKeys).to.eql([
          'id',
          'name',
          'gist_id',
          'files',
          'versions'
        ]);
      });
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