'use strict';

module.exports = function() {
  return (req, res, next) => {
    let messageTypes = ['error', 'warning', 'success', 'info'];
    res.locals.messages = [];
    messageTypes.forEach((mt) => {
      req.flash(mt).forEach((mesg) => {
        res.locals.messages.push({ type: mt, message: mesg });
      });
    });

    return next();
  };
};
