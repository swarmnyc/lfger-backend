'use strict';

const AdminUser = require('../models/admin-user');

module.exports = function(done) {
  let data = {
    name: 'Default Admin',
    email: 'dev@swarmnyc.com',
    password: 'admin!'
  };

  let admin = new AdminUser(data);
  admin.save(done);
};
