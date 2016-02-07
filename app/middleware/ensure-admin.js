module.exports = function() {
  return function(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
      return res.redirect('/login');
    }

    return next();
  };
};
