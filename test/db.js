require('mockgoose')(require('mongoose'));

var expect = require('chai').expect;
var db = require('../lib/db');

describe('DB', function () {
  it('connects to the database', function () {
    expect(require('mongoose').connection).to.not.equal(undefined);
  });
  
  it('throws an error when the database emits and error', function () {
    expect(function () {
      db.emit('error', 'error');
    }).to.throw('Cannot connect to database. error');
  });
});