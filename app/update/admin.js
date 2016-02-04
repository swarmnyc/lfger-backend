'use strict';

const User = require('../models/user');

module.exports = function(done) {
  let data = {
    name: 'Default Admin',
    email: 'dev@swarmnyc.com',
    password: 'admin!',
    role: 'admin'
  };

  let admin = new User(data);
  admin.save(done);
};
