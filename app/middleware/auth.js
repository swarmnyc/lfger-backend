module.exports = function(app) {
  return app.passport.authenticate('local', { failureRedirect: '/login' });
};
