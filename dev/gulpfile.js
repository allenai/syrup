'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var syrup = require('../');
var express = require('express');
var morgan = require('morgan');

syrup.gulp.init(gulp);

gulp.task('start-server', function(cb) {
  var server = express();
  server.use(morgan('dev'));
  server.use(express.static('./build'));
  server.listen(4444, function() {
    gutil.log('HTTP Server listening at ' + gutil.colors.cyan('http://localhost:4444'));
    cb();
  });
});


