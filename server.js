'use strict';
require('newrelic');
const path = require('path');

const start = function() {
  const app = require(path.resolve(__dirname, 'app', 'app'));
  let port = normalizePort(process.env.PORT || '3000');

  app.set('port', port);
  app.on('error', onError);
  app.listen(port, onListening);

  function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return false;
  }

  /**
   * Event listener for HTTP server "error" event.
   */

  function onError(error) {
    app.logger.error(error);
    if (error.syscall !== 'listen') {
      throw error;
    }


    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(port + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(port + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */

  function onListening() {
    app.logger.info('Listening on ' + port);
  }

};

start();
