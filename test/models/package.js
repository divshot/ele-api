require('mockgoose')(require('mongoose'));

var expect = require('chai').expect;
var Package = require('../../lib/models/package');
var Github = require('../../lib/models/github');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 9876});
var localhost = 'http://localhost:9876';

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
      var releasedAt;
      
      before(function (done) {
        releasedAt = new Date();
          
        var package1 = new Package({
          name: 'package1',
          user_id: '123',
          versions: [
            {
              number: '0.2.0',
              created_at: releasedAt
            }
          ]
        });
        
        var package2 = new Package({
          name: 'package2',
          user_id: '123',
          versions: [
            {
              number: '0.1.0',
              created_at: releasedAt
            }
          ]
        });
        
        package2.save(function () {
          package1.save(done);
        });
      });
      
      after(function (done) {
        Package.find({name: 'package1'}).remove(function () {
          Package.find({name: 'package2'}).remove(done);
        });
      });
      
      it('finds all packages associated with a user id sorted by package name', function (done) {
        Package.findForUserId('123', function (err, packages) {
          expect(packages[0].name).to.equal('package1');
          expect(packages).to.have.length(2);
          expect(packages[0].released_at).to.eql(releasedAt);
          done();
        });
      });
      
      it('returns packages formatted for a response', function (done) {
        Package.findForUserId('123', function (err, packages) {
          expect(packages[0].released_at).to.eql(releasedAt);
          expect(Object.keys(packages[0])).to.eql([
            'name',
            'id',
            'version',
            'released_at'
          ]);
          done();
        });
      });
    });
    
    describe('.findByIdOrName(packageId, userId, callback, raw)', function () {
      var package;
      
      before(function (done) {
        package = new Package({
          name: 'package',
          user_id: '123'
        });
        
        package.save(done);
      });
      
      after(function (done) {
        package.remove(done);
      });
      
      it('finds a package by package id', function (done) {
        Package.findByIdOrName(package._id, '123', function (err, p) {
          expect(p._id).to.equal(package._id);
          done();
        });
      });
      
      it('finds a package by the package name', function (done) {
        Package.findByIdOrName(package.name, '123', function (err, p) {
          expect(p.name).equal(package.name);
          done();
        });
      });
    });
    
    describe('.findFileContentsByPackageIdOrName(filename, packageId, userId, callback)', function () {
      it('gets files contents for a given package', function (done) {
        var package = new Package({
          name: 'package',
          user_id: '123',
          files: [
            {
              name: 'file.html',
              content: 'file content'
            }
          ]
        });
        
        package.save(function () {
          Package.findFileContentsByPackageIdOrName('file.html', 'package', '123', function (err, content) {
            expect(content).to.equal('file content');
            package.remove(done);
          });
        });
      });
      
      it('returns a "noPackage" error if package is not foudn', function (done) {
        Package.findFileContentsByPackageIdOrName('file.html', 'no-package', '123', function (err, content) {
          expect(err.noPackage).to.equal(true);
          done();
        });
      });
    });
    
    describe('.findFileContentsFromVersion(options, callback)', function () {
      var package;
      var gh;
      
      beforeEach(function (done) {
        var sha = '123456';
        gh = new Github('token');
        
        gh.getGistFileContentsForCommit = function (gistId, _sha, done) {
          // Only works if sha matches sha in version number given
          if (_sha === sha) done(null, {'file.html': {content:'file content'}});
          else done();
        };
        
        package = new Package({
          name: 'package',
          user_id: '123',
          gist_id: '456',
          versions: [
            {
              number: '0.2.0',
              sha: sha
            },
            {
              number: '0.1.0',
              sha: '654321'
            }
          ],
          files: [
            {
              name: 'file.html',
              content: 'file content'
            }
          ]
        });
        
        package.save(function () {
          server.start(done);
        });
      });
      
      afterEach(function (done) {
        package.remove(function () {
          server.stop(done);
        });
      });
      
      it('gets the content for the the given version', function (done) {
        Package.findFileContentsFromVersion({
          filename: 'file.html',
          packageId: 'package',
          userId: '123',
          number: '0.2.0',
          _github: gh
        }, function (err, content) {
          expect(content).to.equal('file content');
          done();
        });
      });
      
      it('gets the content for the "latest" version', function (done) {
        Package.findFileContentsFromVersion({
          filename: 'file.html',
          packageId: 'package',
          userId: '123',
          number: 'latest',
          _github: gh
        }, function (err, content) {
          expect(content).to.equal('file content');
          done();
        });
      });
      
      it('gets the content for the "dev" version', function (done) {
        Package.findFileContentsFromVersion({
          filename: 'file.html',
          packageId: 'package',
          userId: '123',
          number: 'dev'
        }, function (err, content) {
          expect(content).to.equal('file content');
          done();
        });
      });
    });
    
    describe('.getVersion(options, callback)', function () {
      var package;
      
      beforeEach(function (done) {
        package = new Package({
          name: 'package',
          user_id: '123',
          versions: [
            {number: '0.1.0', sha: '123'},
            {number: '0.2.0', sha: '456'}
          ]
        });
        
        package.save(done);
      });
      
      afterEach(function (done) {
        package.remove(done);
      });
      
      it('gets a version from a package', function (done) {
        Package.getVersion({
          packageId: 'package',
          userId: '123',
          number: '0.1.0'
        }, function (err, version, package) {
          expect(version.number).to.equal('0.1.0');
          expect(version.sha).to.equal('123');
          done();
        });
      });
      
      it('gets the latest version from a package', function (done) {
        Package.getVersion({
          packageId: 'package',
          userId: '123',
          number: 'latest'
        }, function (err, version, package) {
          expect(version.number).to.equal('0.2.0');
          expect(version.sha).to.equal('456');
          done();
        });
      });
      
      it('returns null for a package not found', function (done) {
        Package.getVersion({
          packageId: 'package1',
          userId: '123',
          number: '0.1.0'
        }, function (err, version, package) {
          expect(version).to.equal(null);
          expect(package).to.equal(null);
          done();
        });
      });
    });
    
    describe('.updateByIdOrName(options, callback)', function () {
      var package;
      
      beforeEach(function (done) {
        package = new Package({
          name: 'package',
          user_id: '123',
          files: [
            {
              name: 'package.html',
              content: '<package></package>'
            }
          ]
        });
        
        package.save(done);
      });
      
      afterEach(function (done) {
        package.remove(done);
      });
      
      it('updates a package', function (done) {
        Package.updateByIdOrName({
          packageId: 'package',
          userId: '123',
          data: {
            gist_id: '456'
          }
        }, function (err, saved, p) {
          expect(saved).to.equal(true);
          expect(p.gist_id).to.equal('456');
          done();
        });
      });
      
      it('updates the file content of the source file', function (done) {
        Package.updateByIdOrName({
          packageId: 'package',
          userId: '123',
          data: {
            source: 'new content'
          }
        }, function (err, saved, p) {
          expect(p.files[0].content).to.equal('new content');
          done();
        });
      });
      
      it('updates the file content of the demo file', function (done) {
        Package.updateByIdOrName({
          packageId: 'package',
          userId: '123',
          data: {
            demo: 'demo content'
          }
        }, function (err, saved, p) {
          expect(p.files[1].content).to.equal('demo content');
          done();
        });
      });
      
      it('updates the source file name if package changes name', function (done) {
        Package.updateByIdOrName({
          packageId: 'package',
          userId: '123',
          data: {
            name: 'new-package'
          }
        }, function (err, saved, p) {
          expect(p.files[0].name).to.equal('new-package.html');
          done();
        });
      });
    });
    
    describe('.updateFileContents(options, callback)', function (done) {
      var package;
      
      beforeEach(function (done) {
        package = new Package({
          name: 'package',
          user_id: '123',
          files: [
            {
              name: 'file.html',
              content: 'old content'
            }
          ]
        });
        
        package.save(done);
      });
      
      afterEach(function (done) {
        package.remove(done);
      });
      
      it('sets the contents of file for the given package', function (done) {
        Package.updateFileContents({
          packageId: 'package',
          userId: '123',
          filename: 'file.html',
          content: 'new content'
        }, function (err, saved, p) {
          expect(p.files[0].content).to.equal('new content');
          done();
        });
      });
    });
    
    describe('.isVersionUniqueAndGreatest(options, callback)', function () {
      var package;
      
      beforeEach(function (done) {
        package = new Package({
          name: 'package',
          user_id: '123',
          versions: [
            {number: '0.1.0'},
            {number: '0.2.0'}
          ]
        });
        
        package.save(done);
      });
      
      afterEach(function (done) {
        package.remove(done);
      });
      
      it('tests if version number is unique for a package', function (done) {
        Package.isVersionUniqueAndGreatest({
          packageId: 'package',
          userId: '123',
          number: '0.3.0'
        }, function (err, isUnique, isGreatest, p) {
          expect(isUnique).to.equal(true);
          expect(p).to.not.equal(undefined);
          done();
        });
      });
      
      it('tests if version number is not unique for a package', function (done) {
        Package.isVersionUniqueAndGreatest({
          packageId: 'package',
          userId: '123',
          number: '0.2.0'
        }, function (err, isUnique) {
          expect(isUnique).to.equal(false);
          done();
        });
      });
      
      it('tests if version number is the greatest out of all version of package', function (done) {
        Package.isVersionUniqueAndGreatest({
          packageId: 'package',
          userId: '123',
          number: '0.3.0'
        }, function (err, isUnique, isGreatest) {
          expect(isGreatest).to.equal(true);
          done();
        });
      });
      
      it('tests if version number is not the greatest out of all version of package', function (done) {
        Package.isVersionUniqueAndGreatest({
          packageId: 'package',
          userId: '123',
          number: '0.0.1'
        }, function (err, isUnique, isGreatest) {
          expect(isGreatest).to.equal(false);
          done();
        });
      });
    });
    
    describe('.isNameUnique(packageId, name, userId, callback)', function () {
      var package;
      
      beforeEach(function (done) {
        package = new Package({
          name: 'package',
          user_id: '123'
        });
        
        package.save(done);
      });
      
      afterEach(function (done) {
        package.remove(done);
      });
      
      it('determines if name is unique within user packages', function (done) {
        Package.isNameUnique(package._id, 'package1', '123', function (err, isUnique) {
          expect(isUnique).to.equal(true);
          done();
        });
      });
      
      it('it fails on non unique package name', function (done) {
        var p = new Package({
          name: 'package1',
          user_id: '123'
        });
        
        p.save(function () {
          Package.isNameUnique(package._id, 'package1', '123', function (err, isUnique) {
            expect(isUnique).to.equal(false);
            p.remove(done);
          });
        });
      });
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