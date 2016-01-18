'use strict';
const _ = require('underscore');
const async = require('async');
const LFGER_CONFIG = require('../lib/config');
const ObjectId = require('mongoose').Types.ObjectId;

const LFGModel = require('../models/lfg');
const PlatformModel = require('../models/platform');
const platformHelper = require('./platform');

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
   * @param {string} searchString - The string of text to query for. Can be either a stringififed ObjectId, platform.name, or platform.shortName
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

      /* Iterates through options object and applies them to the query */
      const applyOpts = function(optValue, optKey, cb) {
        if (typeof optValue !== 'undefined') {
          /* populate() is a method, not a property, so it's treated differently than other options */
          if (optKey === 'populate') {
            mongoQuery.populate(optValue);
          } else {
            mongoQuery.options[optKey] = optValue;
          }
        }

        cb();
      };

      platformHelper.findPlatformByIdOrName(searchString).then(function(platform) {
        mongoQuery = LFGModel.find({ platform: platform._id });

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

    if (typeof options === 'undefined') {
      options = {};
    }

    /* Apply default options */
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

  return LFGHelper;
}());

module.exports = new LFGHelper();
