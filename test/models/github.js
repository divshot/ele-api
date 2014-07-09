var expect = require('chai').expect;
var Github = require('../../lib/models/github');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 9876});

describe('model: Github', function () {
  var gh;
  var localhost = 'http://localhost:9876';
  
  beforeEach(function (done) {
    gh = new Github('token');
    gh._host = localhost;
    server.start(done);
  });
  
  afterEach(function (done) {
    server.stop(done);
  });
  
  describe('new Github()', function () {
    it('sets a host', function () {
      expect(gh._host).to.equal(localhost);
    });
    
    it('sets the token', function () {
      expect(gh.token).to.equal('token');
    });
    
    describe('.headers()', function () {
      it('sets the authorization header', function () {
        expect(gh.headers().Authorization).to.equal('Bearer token');
      });
      
      it('sets a defaul user agent', function () {
        expect(gh.headers()['User-Agent']).to.equal('Node');
      });
    });
    
    describe('.hostWithClient(uri)', function () {
      it('builds api url with client credentials', function () {
        process.env.GITHUB_KEY = 'github_key';
        process.env.GITHUB_SECRET = 'github_secret';
        
        expect(gh.hostWithClient('/repos')).to.equal(localhost + '/repos?client_id=github_keyclient_secret=github_secret');
      });
    });
    
    describe('.host(uri)', function () {
      it('gets the host', function () {
        expect(gh.host('/repos')).to.equal(localhost + '/repos');
      });
    });
    
    describe('.getUserByUsername(username, callback)', function () {
      it('gets user data from Github by the Github login', function (done) {
        
        // TODO: write this test
        
        done();
      });
    });
    
    
    
    describe('.createGist(data, callback)', function () {
      it('makes a request to createa gist on Github', function (done) {
        gh.createGist({name: 'name'}, function (err, body) {
          expect(body.headers).to.contain.keys(Object.keys(gh.headers()).map(function (key) { return key.toLowerCase(); }));
          expect(body.method).to.equal('POST');
          expect(body.url).to.equal('/gists');          
          done();
        });
      });
    });
    
  });
  
  describe('Github', function () {
    describe('.latestGistVersion(gist)', function () {
      it('gets the latest version', function () {
        var gist = {
          history: [
            {commited_at: new Date(2014, 1), version: '1'},
            {commited_at: new Date(2014, 2), version: '2'}
          ]
        };
        
        expect(Github.latestGistVersion(gist)).to.equal('2');
      });
    });
  });
});