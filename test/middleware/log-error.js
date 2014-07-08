var logError = require('../../lib/middleware/log-error');
var logger = require('../../lib/logger');
var request = require('supertest');
var expect = require('chai').expect;
var express = require('express');
var boom = require('express-boom');

describe('middleware: log-error', function () {
  var app;
  
  beforeEach(function () {
    app = express()
      .use(boom())
      .use(logError());
  });
  
  after(function () {
    delete require.cache['../../lib/logger'];
  });
  
  describe('req.logError', function () {
    it('outputs error to console', function (done) {
      var output = [];
      
      app.use(function (req, res, next) {
        req.logError(new Error('error'));
        next();
      });
      
      logger.error = function (msg) {
        output.push(msg);
      };
      
      request(app)
        .get('/error')
        .expect(function () {
          expect(output[0]).to.equal('/error');
          expect(output[1]).to.equal('error');
          expect(output[2]).to.not.equal(undefined);
        })
        .end(done);
    });
  });
  
  describe('res.withError', function () {
    it('logs the error', function (done) {
      var called = false;
      
      app.use(function (req, res, next) {
        req.logError = function () {
          called = true;
        };
        res.withError(new Error('error'));
      });
      
      request(app)
        .get('/')
        .expect(function () {
          expect(called).to.equal(true);
        })
        .end(done);
    });
    
    it('responds with the error', function (done) {
      app.use(function (req, res, next) {
        req.logError = function () {};
        res.withError(new Error('error'));
      });
      
      request(app)
        .get('/')
        .expect(500)
        .expect(function (data) {
          expect(JSON.parse(data.res.text)).to.contain.key('error');
          expect(JSON.parse(data.res.text)).to.contain.key('statusCode');
          expect(JSON.parse(data.res.text)).to.contain.key('message');
        })
        .end(done);
    });
  });
});