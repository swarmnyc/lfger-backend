'use strict';

const Platform = require('../models/platform');
const LFG = require('../models/lfg');
const async = require('async');
const _ = require('underscore');

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
    let newPlatforms = [];

    const createNewPlatforms = function(cb) {
      async.each(data, function(item, _cb) {
        let system = new Platform(item);
        system.save(function(err, doc) {
          if (err) {
            return _cb(err);
          }

          newPlatforms.push(doc);
          _cb();
        });
      }, cb);
    };

    const migrateLFGs = function(cb) {
      LFG.find().populate('platform').exec(function(err, lfgs) {
        if (err) {
          return cb(err);
        }

        async.each(lfgs, function(lfg, _cb) {
          if (!lfg.platform) {
            return _cb();
          }

          async.each(newPlatforms, function(newPlatform, _callback) {
            let nameRegExp = new RegExp(newPlatform.name, 'i');
            let shortNameRegExp = new RegExp(newPlatform.name, 'i');

            if (nameRegExp.test(lfg.platform.name) && shortNameRegExp.test(lfg.platform.shortName)) {
              lfg.platform = newPlatform._id;
              return lfg.save(_cb);
            }

            return _callback();
          }, _cb);
        }, cb);
      });
    };

    const clearOldPlatforms = function(cb) {
      Platform.find().exec(function(err, platforms) {
        let newIds = _.map(_.pluck(newPlatforms, '_id'), function(_id) {
          return _id.toString();
        });

        let oldPlatforms = _.reject(platforms, function(platform) {
          return _.contains(newIds, platform._id.toString());
        });

        async.each(oldPlatforms, function(platform, _cb) {
          platform.remove(_cb);
        }, cb);
      });
    };

    async.series([createNewPlatforms, migrateLFGs, clearOldPlatforms], done);
};
