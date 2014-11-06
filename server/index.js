'use strict';

var q = require('q');
var path = require('path');
var child_process = require('child_process');

var server;

module.exports = {
  /**
   * Starts an express + griddle based HTTP server with the specified options.  The HTTP server
   * serves static files located in options.serve which are built dynamically using the gulpfile
   * located in options.base.   If options.watch is set to true, the project is rebuilt everytime
   * changes within options.base are detected.
   *
   * @param {object}  options                   Server options.
   * @param {object}  options.base              The base path to the project (where the gulpfile lives).
   * @param {string}  options.serve             The directory from which to serve static files.
   * @param {string}  [options.watch=undefined] Directory to watch for changes and trigger rebuilds
   *                                            as they occur.
   * @param {number}  [options.port=4000]       The port to listen on, defaults to 4000.
   *
   * @returns {Promise} A promise which is resolved once the server is started.
   */
  start: function(options) {
    var started = q.defer()
    if(!server) {
      var args = [];
      for(var option in options) {
        if(options.hasOwnProperty(option)) {
          args.push('--' + option + '=' + options[option]);
        }
      }
      server = child_process.fork(path.resolve(__dirname, 'server'), args);
      server.on('error', function(e) {
        started.reject(e);
      });
      server.on('message', function(m) {
        started.resolve(m);
      });
    } else {
      started.resolve('The server is already running');
    }
    return started.promise;
  },
  /**
   * Stops a server if there's one running.
   *
   * @returns {Promise} A promise which is resolved once the server is stopped.
   */
  stop: function() {
    var stopped = q.defer();
    if(server) {
      server.on('close', function() {
        stopped.resolve();
      });
      server.kill();
    }
    return stopped.promise;
  }
}

