module.exports = function () {
  return function (req, res, next) {
    if (req.context.user.github_id + '' !== req.user.github_id + '') return res.send(401);
    next();
  };
};