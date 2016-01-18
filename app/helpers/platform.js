'use strict';
const ObjectId = require('mongoose').Types.ObjectId;

const PlatformModel = require('../models/platform');

const PlatformHelper = (function() {
  const PlatformHelper = function() {};
  PlatformHelper.prototype = Object.create(null);
  PlatformHelper.prototype.constructor = PlatformHelper;

  /**
   * @method
   * @param {string} searchString - The string of text to query for. Can be either a stringififed ObjectId, platform.name, or platform.shortName
   * @param {function} [callback] - Callback function containing the results of the query. If a callback is not provided, a Promise object is returned.
   *
   * @returns {Promise}
   */
  PlatformHelper.prototype.findPlatformByIdOrName = function(searchString, callback) {
    const query = function(callback) {
      let tempId;
      let tempString;
      let searchObject;

      /* First check if queryString is a valid ObjectId */
      if (ObjectId.isValid(searchString)) {
        tempId = new ObjectId(searchString);

        if (tempId.toString() === searchString) {
          searchObject = { _id: searchString };
        }
      }

      /* Not an ObjectId, so we return an $or statement for name and shortName */
      /* Set as RegExp for case-insensitive search */
      if (!searchObject) {
        tempString = new RegExp(searchString.replace('-', ' '), 'i');
        searchObject = { $or: [{ name: tempString }, { shortName: tempString }]};
      }

      PlatformModel.findOne(searchObject).exec(callback);
    };

    if (typeof callback === 'function') {
      return query(callback);
    }

    return new Promise(function(resolve, reject) {
      query(function(err, result) {
        if (err) {
          return reject(err);
        }

        if (!result) {
          return reject(searchString + ' does not match any platforms');
        }

        return resolve(result);
      });
    });
  };

  return PlatformHelper;
}());

module.exports = new PlatformHelper();
