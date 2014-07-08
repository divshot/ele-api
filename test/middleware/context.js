var context = require('../../lib/middleware/context');
var request = require('supertest');
var expect = require('chai').expect;
var express = require('express');

describe('middleware: context', function () {
  var app;
  
  beforeEach(function () {
    app = express()
      .use(context());
  });
  
  describe('req.context', function () {
    it('sets a context object on the request object', function (done) {
      var ctx;
      
      app.use(function (req, res, next) {
        ctx = req.context;
        next();
      });
      
      request(app)
        .get('/')
        .expect(function () {
          expect(ctx).to.eql({});
        })
        .end(done);
    });
  });
});