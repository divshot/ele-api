var setUserIfToken = require('../../lib/middleware/set-user-if-token');
var request = require('supertest');
var expect = require('chai').expect;
var express = require('express');

// TODO: instead of focusing on implementation details with models, find
// a way to mock the model methods

describe('middleware: set-user-if-token', function () {
  var app;
  
  beforeEach(function () {
    app = express()
      .use(function (req, res, next) {
        req.headers.authorization = 'u:p';
        next();
      });
  });
  
  describe('unauthenticated user', function () {
    it('skips middleware', function (done) {
      app
        .use(function (req, res, next) {
          delete req.headers.authorization;
          next();
        })
        .use(setUserIfToken())
        .use(function (req, res, next) {
          res.end('skipped');
        });
      
      request(app)
        .get('/')
        .expect('skipped')
        .end(done);
    });
  });
  
  describe('registered user', function () {
    it('sets user on request object', function (done) {
      var user;
      var User = {
        findOne: function (options, done) {
          done(null, {name: 'user'});
        }
      };
      
      app
        .use(setUserIfToken({User: User}))
        .use(function (req, res, next) {
          user = req.user;
          next();
        });
      
      request(app)
        .get('/')
        .expect(function () {
          expect(user).to.eql({name: 'user'});
        })
        .end(done);
    });
  });
  
  describe('non-registered user', function () {
    it('gets user data from Github', function (done) {
      var user;
      var User = {
        findOne: function (options, done) {
          done();
        }
      };
      var Github = function (token) {
        this.getUserByAccessToken = function (done) {
          done(null, {
            id: 'id',
            login: 'login'
          });
        };
      };
      
      app
        .use(setUserIfToken({
          User: User,
          Github: Github
        }))
        .use(function (req, res, next) {
          user = req.user;
          next();
        });
      
      request(app)
        .get('/')
        .expect(function () {
          expect(user.github_id).to.equal('id');
          expect(user.username).to.equal('login');
        })
        .end(done);
    });
  });
});