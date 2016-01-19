'use strict';
const _ = require('underscore');
const lfgUtils = require('../lib/utils');
const LFGER_CONFIG = require('../lib/config');

const GameModel = require('../models/game');

const GameHelper = (function() {
  const GameHelper = function() {};
  GameHelper.prototype = Object.create(null);
  GameHelper.prototype.constructor = GameHelper;

  GameHelper.prototype.findGamesByNameorAlias = function(searchString, options, callback) {
    const query = function(callback) {
      let caseInsensitiveSearchString = new RegExp(searchString, 'i');
      let mongoQuery = GameModel.find({ $or: [{ name: caseInsensitiveSearchString }, { aliases: { $in: [ caseInsensitiveSearchString ] }}]});

      lfgUtils.applyQueryOptions(mongoQuery, options, function(err, mongoQuery) {
        if (err) {
          return callback(err);
        }

        mongoQuery.exec(function(err, games) {
          let helper;
          if (err) {
            return callback(err);
          }

          helper = new GameHelper();
          helper.sortByLFGs(games, -1, callback);
        });
      });
    };

    let defaults = {
      limit: undefined,
      sort: LFGER_CONFIG.QUERY_SORT
    };

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (typeof options === 'undefined') {
      options = {};
    }

    _.defaults(options, defaults);

    /* Return a Promise object if no callback was passed */
    if (typeof callback === 'undefined') {
      return new Promise(function(resolve, reject) {
        query(options, function(err, results) {
          if (err) {
            return reject(err);
          }

          return resolve(results);
        });
      });
    } else {
      query(options, callback);
    }
  };

  return GameHelper;
}());

module.exports = new GameHelper();
