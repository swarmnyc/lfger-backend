/* jshint bitwise:false */
'use strict';
/**
 * Creates an admin interface and route from a mongoose module/app route
 *
 * Created by Joey Lappin 2016-02-05
 * SWARM NYC
 *
 *
 */

/* External Dependencies */
const   async   =   require('async');
const   fs      =   require('fs');
const   path    =   require('path');
/* End External Dependencies */

/* Modules */
const   helper  =   require(path.join(__dirname, 'lib', 'helper'));
const   CONFIG  =   require(path.join(__dirname, 'lib', 'config'));
/* End Modules */

module.exports = (function() {
  const preparePaths = function(callback) {
    const paths = [CONFIG.VIEWS_PATH, CONFIG.ROUTES_PATH];

    const _do = function(p, cb) {
        fs.access(p, fs.W_OK | fs.R_OK, (err) => {
          if (err) {
            return fs.mkdir(p, cb);
          }

          return cb();
        });
    };

    async.each(paths, _do, callback);
  };

  const loadTemplates = function(callback) {
    const files = ['detail', 'list'];
    let templates = {};

    async.each(files, (file, done) => {
      helper.getTemplate('templates/' + file + '.jade', (err, template) => {
        templates[file] = template;
        return done();
      });
    }, () => {
      return callback(null, templates);
    });
  };

  const loadModels = function(templates, callback) {
    helper.bootstrap('app/models', (err, models) => {
      return callback(err, templates, models);
    });
  };

  const processModels = function(err, templates, models) {

    /* Iterate through each models' schema and generate a HTML admin template */
    async.forEachOf(models, (model, name, done) => {
      helper.log('Processing admin module for ' + name + '...');

      const doRoute = function(callback) {
        let route = helper.makeRoute({ authMiddlewareFn: 'app.middleware.ensureAdmin', modelName: model.modelName, modelPath: path.join(__dirname, '..', 'app', 'models', name), listView: name + '-list', detailView: name + '-detail' });
        fs.writeFile(path.join(CONFIG.ROUTES_PATH, name + '.js'), route, callback);
      };

      const doListView = function(callback) {
        return callback();
      };

      /* Iterates through each field in a model's schema path and generates templated HTML based on that */
      const doDetailView = function(callback) {
        let locals = {
          inputs: []
        };

        const doCompile = function(err) {
          let compiled;

          if (err) {
            return callback(err);
          }

          compiled = templates.detail(locals);
          fs.writeFile(path.join(CONFIG.VIEWS_PATH, name + '.html'), compiled, callback);
        };

        const doTitle = function(cb) {
          locals.title = helper.toProperCase(name);
          return cb();
        };

        const doField = function(fieldContents, fieldName, cb) {
          let schemaType = fieldContents.options.type.schemaName;
          let fieldType;
          if (fieldContents.path === '__v') {
            return cb();
          }

          helper.log('Processing field ' + fieldName + ' in ' + name + '...');

          switch (schemaType) {
            case 'ObjectId':
            break;

            case 'String':
              fieldType = 'text';
            break;

            case 'Number':

            break;

            case 'Boolean':
              fieldType = 'checkbox';
            break;

            default:
              helper.log(fieldName + ' is not of an editable type. Skipping...');
            break;
          }

          locals.inputs.push({ name: fieldName, label: helper.toProperCase(fieldName), type: fieldType });
          return cb();
        };

        const doFields = function(cb) {
            async.forEachOf(model.schema.paths, doField, cb);
        };

        async.parallel([doTitle, doFields], doCompile);

      };

      const addRoutes = function(callback) {
        fs.access(path.join(CONFIG.ROUTES_PATH, name), fs.W_OK | fs.R_OK, (err) => {
          if (err) {
            return doRoute(callback);
          }

          helper.log(name + ' route already exists');
          return callback();
        });
      };

      const addViews = function(callback) {

          /* First check if view already exists for given view */
          fs.access(path.join(CONFIG.VIEWS_PATH, name + '-detail'), fs.W_OK | fs.R_OK, (err) => {
            if (err) {
              async.series([doListView, doDetailView], callback);
            }

            helper.log(name + ' view already exists');
            return callback();
          });
      };

      async.parallel([addViews, addRoutes], done);
    });
  };

  async.waterfall([preparePaths, loadTemplates, loadModels], processModels);
}());
