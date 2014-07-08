var currentUserPackage = require('../../lib/middleware/current-user-package');
var context = require('../../lib/middleware/context');
var request = require('supertest');
var expect = require('chai').expect;
var express = require('express');
var boom = require('express-boom');

describe('middleare: current-user-package', function () {
  var app;
  
  beforeEach(function () {
    app = express()
      .use(boom())
      .use(context());
  });
  
  describe('authorized', function () {
    it('skips middleware if user is authorized', function (done) {
      app
        .use(function (req, res, next) {
          req.context.user = {
            github_id: '123'
          };
          req.user = {
            github_id: '123'
          };
          next();
        })
        .use(currentUserPackage());
        
      request(app)
        .get('/')
        .expect(404)
        .end(done);
    });
  });
  
  describe('unauthorized', function () {
    it('responds with unauthorized', function (done) {
      app
        .use(function (req, res, next) {
          req.context.user = {github_id: '123'};
          req.user = {};
          next();
        })
        .use(currentUserPackage());
        
      request(app)
        .get('/')
        .expect(401)
        .expect(function (data) {
          var r = JSON.parse(data.res.text);
          
          expect(r).to.contain.key('statusCode');
          expect(r).to.contain.key('error');
        })
        .end(done);
    });
  });
});