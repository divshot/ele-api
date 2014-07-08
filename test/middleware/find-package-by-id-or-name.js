var request = require('supertest');
var expect = require('chai').expect;
var express = require('express');
var boom = require('express-boom');
var logError = require('../../lib/middleware/log-error');
var findPackageByIdOrName = require('../../lib/middleware/find-package-by-id-or-name');

describe('middleware: find-package-by-id-or-name', function () {
  var app;
  
  beforeEach(function () {
    app = express()
      .use(boom())
      .use(function (req, res, next) {
        req.context = {user: {}};
        req.params = {package: {}};
        next();
      });
  });
  
  describe('read error', function () {
    it('responds with 500 error when error reading from db', function (done) {
      app
        .use(logError({testMode: true}))
        .use(findPackageByIdOrName({
          Package: {
            findByIdOrName: function (packageId, userId, done) {
              done(new Error('error'));
            }
          }
        }));
        
      request(app)
        .get('/')
        .expect(500)
        .expect(function (data) {
          var r = JSON.parse(data.res.text);
           
           expect(r).to.contain.key('error');
           expect(r).to.contain.key('statusCode');
           expect(r).to.contain.key('message');
        })
        .end(done);
    });
  });
  
  describe('missing package', function () {
    it('responds with not found when package is missing', function (done) {
      app.use(findPackageByIdOrName({
        Package: {
          findByIdOrName: function (packageId, userId, done) {
            done();
          }
        }
      }));
      
      request(app)
        .get('/')
        .expect(404)
        .expect(function (data) {
          var r = JSON.parse(data.res.text);
          
          expect(r).to.contain.key('statusCode');
          expect(r).to.contain.key('error');
          expect(r).to.contain.key('message');
        })
        .end(done);
    });
  });
  
  describe('package found', function () {
    it('sets the package on the context if it is found', function (done) {
      var packageOnContext;
      
      app
        .use(findPackageByIdOrName({
          Package: {
            findByIdOrName: function (packageId, userId, done) {
              done(null, {name: 'package'});
            }
          }
        }))
        .use(function (req, res, next) {
          packageOnContext = req.context.package;
          next();
        });
      
      request(app)
        .get('/')
        .expect(function () {
          expect(packageOnContext).to.eql({name: 'package'});
        })
        .end(done);
    });
  });
});