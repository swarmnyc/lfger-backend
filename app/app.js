'use strict';
require('dotenv').load();
const express = require('express');
const path = require('path');
const fs = require('fs');
const _ = require('underscore');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
const debug = require('debug')('lfger-backend');
const lfgUtils = require(path.resolve(__dirname, 'lib', 'utils'));
const winston = require('winston');

const app = express();
app.logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({ filename: 'error.log' }),
    new (winston.transports.Console)()
  ]
});

/* Connect to MongoDB */
const connect = function() {
  let options = { server: { socketOptions: { keepAlive: 1 } } };
  mongoose.connect(process.env.NODE_ENV === 'test' ? 'mongodb://127.0.0.1/node-test' : process.env.DATABASE_URL, options);
};
mongoose.connection.on('error', debug);
mongoose.connection.on('disconnected', connect);
connect();

const bindRoutes = function(app) {
  const routesPath = path.resolve(__dirname, 'routes');
  let files = fs.readdirSync(routesPath);

  files.forEach(function(file) {
    let route;

    if (path.extname(file) !== '.js') {
      return;
    }

    app.logger.info('Binding route: ' + '/' + path.basename(file, '.js'));
    route = require(path.resolve(routesPath, file));
    app.use('/' + path.basename(file, '.js'), route(app));
  });
};

const bindMiddleware = function(app) {
  const middlewarePath = path.resolve(__dirname, 'middleware');
  let files = fs.readdirSync(middlewarePath);
  app.middleware = {};

  files.forEach(function(file) {
    if (path.extname(file) !== '.js') {
      return;
    }

    app.logger.info('Loading middleware from ' + file);
    app.middleware[lfgUtils.toCamelCase(path.basename(file, '.js'))] = require(path.resolve(middlewarePath, file))(app);
  });
};

/* Bind DB models to request */
const bindModels = function(app) {
  const modelsPath = path.resolve(__dirname, 'models');
  let files = fs.readdirSync(modelsPath);

  app.db = {};

  files.forEach(function(file) {
    let model;
    if (path.extname(file) !== '.js') {
      return;
    }

    model = require(path.resolve(modelsPath, file));
    app.logger.info('Importing ' + model.modelName + '...');

    app.db[model.modelName] = model;
  });
};

const applyUpdates = function(app) {
  const updatesPath = path.resolve(__dirname, 'update');
  let files = fs.readdirSync(updatesPath);

  app.logger.info('Finding updates...');

  return app.db.Update.find().exec(function(err, updates) {
    return files.forEach(function(file) {
      let update;

      if (path.extname(file) !== '.js' || _.findWhere(updates, { filename: path.basename(file) })) {
        return;
      }

      update = require(path.resolve(updatesPath, file))(function(err) {
        let record;

        if (err) {
          return;
        }

        record = new app.db.Update({
          filename: file
        });

        return record.save();
      });
    });
  });

};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('env', process.env.NODE_ENV);

app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-session')({ secret: 'asdjflkajsdfkljalkvjalkdjfeowrj34u9-4iojlsdfljk', resave: false, saveUninitialized: false }));
app.passport = require(path.resolve(__dirname, 'lib', 'passport'))(app);

bindModels(app);
bindMiddleware(app);

app.use(app.middleware.db);
bindRoutes(app);
applyUpdates(app);

app.get('/', function(req, res) {
  res.render('index');
});

// catch 404 and forward to error handler
app.use(function(req, res) {
  res.status(404).send();
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development' || app.get('env') === 'test') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
    app.logger.error(err);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
  app.logger.error(err);
});

module.exports = app;
