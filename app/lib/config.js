'use strict';

/* Default config options for LFGer API */
const LFGER_CONFIG = {
  QUERY_SORT: { createdAt: -1 },  /* Default sorting for LFG queries. */
  POPULATE_PLATFORMS: true, /* Populate platforms on LFGer queries. If this is set to false, will only return platform._id */
  WHITELISTED_DOMAINS: [ 'http://lfger.com', 'https://www.lfger.com', 'http://www.lfger.com', 'https://lfger.com' ]
};

module.exports = LFGER_CONFIG;
