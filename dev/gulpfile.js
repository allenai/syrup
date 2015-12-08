'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
// this requires you have syrup available globally. Dev workflow is to generate a link
// locally to syrup and then dev on this dev project. To create the syrup link:
// $ cd path/to/syrup && npm link
var syrup = require('syrup');
var express = require('express');
var morgan = require('morgan');

syrup.gulp.init(gulp);

gulp.task('start-server', ['watch'], function(cb) {
  var server = express();
  server.use(morgan('dev'));
  server.use(express.static('./build'));
  server.listen(4444, function() {
    gutil.log('HTTP Server listening at ' + gutil.colors.cyan('http://localhost:4444'));
    cb();
  });
});
