'use strict';
const _ = require('underscore');
const async = require('async');
const LFGER_CONFIG = require('../lib/config');
const ObjectId = require('mongoose').Types.ObjectId;

const LFGModel = require('../models/lfg');
const PlatformModel = require('../models/platform');

const LFGHelper = (function() {

  /**
   * Object containing common queries
   * @constructor
   */
  const LFGHelper = function() {};
  LFGHelper.prototype = Object.create(null);
  LFGHelper.prototype.constructor = LFGHelper;

  /**
   * @method
   * @param {string} queryString - The string of text to query for. Can be either a stringififed ObjectId, platform.name, or platform.shortName
   * @param {object} [options] - An options object
   *  @property {object} [options.sort] - An object
   *  @property {number} [options.limit] - Limit on how many results should be returned. Default is unlimited.
   *  @property {array|string} [options.populate] - What fields to auto-populate. Defaults to platform is POPULATE_PLATFORMS is enabled in LFGER_CONFIG.
   * @param {function} [callback] - Callback function containing the results of the query. If a callback is not provided, a Promise object is returned.
   *
   * @returns {Promise}
   */
  LFGHelper.prototype.findLFGsByPlatform = function(searchString, options, callback) {
    const query = function(options, callback) {
      let mongoQuery;
      let search;

      /* Builds query string to avoid typecast errors */
      const buildSearch = function(searchString) {
        return new Promise(function(resolve, reject) {
          let tempId;
          let tempString;

          /* First check if queryString is a valid ObjectId */
          if (ObjectId.isValid(searchString)) {
            tempId = new ObjectId(searchString);

            if (tempId.toString() === searchString) {
              return resolve({ platform: searchString });
            }
          }

          /* Not an ObjectId, so we return an $or statement for name and shortName */
          /* Set as RegExp for case-insensitive search */
          tempString = new RegExp(searchString, 'i');
          PlatformModel.findOne({ $or: [{ name: tempString }, { shortName: tempString }] }).exec(function(err, platform) {
            if (err) {
              return reject(err);
            }

            if (!platform) {
              return reject(searchString + ' not found');
            }

            return resolve({ platform: platform._id });
          });
        });
      };

      /* Iterates through options object and applies them to the query */
      const applyOpts = function(optValue, optKey, cb) {
        if (typeof optValue !== 'undefined') {
          mongoQuery[optKey] = optValue;
        }

        cb();
      };

      search = buildSearch(searchString).then(function() {
        mongoQuery = LFGModel.find(search);

        async.forEachOf(options, applyOpts, function() {
          mongoQuery.exec(callback);
        });
      }).catch(callback);
    };

    let defaults = {
      sort: LFGER_CONFIG.QUERY_SORT,
      limit: undefined,
      populate: LFGER_CONFIG.POPULATE_PLATFORMS ? 'platform' : undefined
    };

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    /* Apply default options */
    _.defaults(options, defaults);

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

  return LFGHelper;
}());

module.exports = new LFGHelper();
