module.exports = function () {
  return function (req, res, next) {
    if (req.context.user.github_id + '' !== req.user.github_id + '') return res.boom.unauthorized();
    next();
  };
};