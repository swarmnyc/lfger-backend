/* Config file for admin generator */

const path    =   require('path');

module.exports = {
  TEMPLATES_PATH:   path.join(__dirname, 'templates'),
  VIEWS_PATH:       path.join(__dirname, '..', 'app', 'views', 'admin'),
  ROUTES_PATH:      path.join(__dirname, '..', 'app', 'routes', 'admin'),
  TEMPLATE_LANG:    'jade' // Accepts html or jade
};
