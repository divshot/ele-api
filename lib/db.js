var logger = require('./logger');
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGOHQ_CONN);

var db = module.exports = mongoose.connection;

db.on('open', function () {
  logger.info('Connected to database.');
});

db.on('error', function (err) {
  throw new Error('Cannot connect to database.' + err);
});
