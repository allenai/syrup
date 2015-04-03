'use strict';

var gulp = require('gulp');
var syrup = require('../');
var express = require('express');
var morgan = require('morgan');

syrup.gulp.init(
  gulp,
  {
    detectGlobals: true,  // Required for React
    jsOut: 'main.js'      // We don't want the compiled JSX to compile to "main.jsx", so override
                          // it here to "main.js"
  },
  undefined,
  {
    js: 'app/main.jsx'
  }
);

gulp.task('start-server', function(cb) {
  var server = express();
  server.use(morgan('dev'));
  server.use(express.static('./build'));
  server.listen(4444, function() {
    gutil.log('HTTP Server listening at ' + gutil.colors.cyan('http://localhost:4444'));
    cb();
  });
});


