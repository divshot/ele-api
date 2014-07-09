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
        gh.getUserByUsername('ele', function (err, res) {
          expect(res.method).to.equal('GET');
          expect(res.url.indexOf('/users/ele')).to.equal(0);
          expectGithubAuthHeaders(res, gh);
          done();
        });
      });
    });
    
    describe('.getUserByAccessToken(callback)', function () {
      it('gets the user', function (done) {
        gh.getUserByAccessToken(function (err, res) {
          expect(res.method).to.equal('GET');
          expect(res.url).to.equal('/user');
          expectGithubAuthHeaders(res, gh);
          done();
        });
      });
    });
    
    describe('.createGist(data, callback)', function () {
      it('makes a request to createa gist on Github', function (done) {
        gh.createGist({name: 'name'}, function (err, res) {
          expect(res.method).to.equal('POST');
          expect(res.url).to.equal('/gists');          
          expectGithubAuthHeaders(res, gh);
          done();
        });
      });
    });
    
    describe('.updateGist(id, data, callback)', function () {
      it('updates the gist on Github', function (done) {
        gh.updateGist(123, {}, function (err, res) {
          
          // TODO: figure out how to test json body data
          // with Mocksy
          
          expect(res.method).to.equal('PATCH');
          expect(res.url).to.equal('/gists/123');
          expectGithubAuthHeaders(res, gh);
          done();
        });
      });
    });
    
    describe('.getGistFileContentsForCommit(id, sha, callback)', function () {
      it('requests and parses the files in a gist on Github', function (done) {
        gh._request = function (options, done) {
          options.files = ['files'];
          var response = JSON.stringify(options);
          done(null, {body: response}, response);
        };
        
        gh.getGistFileContentsForCommit(123, 456, function (err, files) {
          expect(files).to.eql(['files']);
          done();
        });
      });
    });
    
    describe('._request(options, done)', function () {
      it('makes an http request with options', function (done) {
        gh._request({
          url: localhost + '/testing',
          method: 'POST'
        }, function (err, response, body) {
          body = JSON.parse(body);
          expect(body.url).to.equal('/testing');
          expect(body.method).to.equal('POST');
          done();
        });
      });
    });
    
    function expectGithubAuthHeaders (res, gh) {
      expect(res.headers).to.contain.keys(Object.keys(gh.headers()).map(function (key) { return key.toLowerCase(); }));
    }
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