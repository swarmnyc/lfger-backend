'use strict';

const GameSystem = require('../models/game-system');
const async = require('async');

module.exports = function(done) {
    let data = [
      {
        name: 'PC',
        shortName: 'PC',
        gamerUrlPath: null
      },
      {
        name: 'PlayStation 4',
        shortName: 'PS4',
        gamerUrlPath: 'https://my.playstation.com/'
      },
      {
        name: 'Xbox One',
        shortName: 'XB1',
        gamerUrlPath: 'https://account.xbox.com/en-US/Profile?gamerTag='
      }
    ];

    async.each(data, function(item, callback) {
      let system = new GameSystem(item);
      system.save(callback);
    }, done);
};
