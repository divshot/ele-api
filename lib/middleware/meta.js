module.exports = function () {
  return function (req, res, next) {
    req.meta = {};
    next();
  };
};