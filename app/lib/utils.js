'use strict';
const async = require('async');

exports.toCamelCase = function(input) {
  return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
    return group1.toUpperCase();
  });
};

exports.applyQueryOptions = function(query, options, callback) {
  /* Iterates through options object and applies them to the query */
  const _apply = function(optValue, optKey, cb) {
    if (typeof optValue !== 'undefined') {
      /* populate() is a method, not a property, so it's treated differently than other options */
      if (optKey === 'populate') {
        query.populate(optValue);
      } else {
        query.options[optKey] = optValue;
      }
    }

    cb();
  };

  async.forEachOf(options, _apply, function(err) {
    if (err) {
      return callback(err);
    }

    return callback(null, query);
  });
};
