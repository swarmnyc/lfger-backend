'use strict';

const Platform = require('../models/platform');
const async = require('async');

module.exports = function(done) {
    let data = [
      {
        name: 'PC',
        shortName: 'PC',
        gamerProfileUrlPrefix: null
      },
      {
        name: 'PlayStation 4',
        shortName: 'PS4',
        gamerProfileUrlPrefix: 'https://my.playstation.com/'
      },
      {
        name: 'Xbox One',
        shortName: 'XB1',
        gamerProfileUrlPrefix: 'https://account.xbox.com/en-US/Profile?gamerId='
      }
    ];

    async.each(data, function(item, callback) {
      let system = new Platform(item);
      system.save(callback);
    }, done);
};