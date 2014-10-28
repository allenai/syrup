'use strict';

var plumber = require('gulp-plumber');
var cb = require('gulp-cache-breaker');
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var del = require('del');
var gutil = require('gulp-util');
var gif = require('gulp-if');
var util = require('util');
var path = require('path');

module.exports = {
  /**
   * Registers several default gulp tasks.
   *
   * @param {object}  gulp              The gulp library.
   * @param {object}  paths             An object defining a series of paths required for the various tasks.
   * @param {string}  paths.html        Path to the project's HTML files.
   * @param {string}  paths.js          Path to the project's JS files.
   * @param {string}  paths.less        Path to the project's LESS files.
   * @param {string}  paths.assets      Path to th eproject's assets.
   * @param {string}  paths.build       Path to the project's build directory where the final output should be placed.
   * @param {string}  env               An enviroment flag. Can be 'dev' or 'prod'.
   * @param {boolean} [silent=false]    If true no log messages are output.
   *
   * @returns {undefined}
   */
  tasks: function(gulp, paths, env, silent) {
    if(silent === true) {
      gutil.log = gutil.noop;
    }

    if(!gulp || typeof gulp.task !== 'function') {
      throw 'Invalid gulp instance';
    }

    if(!paths || typeof paths !== 'object') {
      throw 'Invalid paths';
    }

    /**
     * Removes all build artifacts.
     */
    gulp.task('clean', function(cb) {
      gutil.log(util.format('Removing artifacts from %s',
          gutil.colors.magenta(paths.build)));
      return del(paths.build + '/**/*', cb);
    });

    /**
     * Copies all html files to the build directory.
     */
    gulp.task('html', [ 'clean', 'js', 'less', 'assets' ], function() {
      gutil.log(util.format('Copying %s to %s',
          gutil.colors.magenta(paths.html), gutil.colors.magenta(paths.build)));
      return gulp.src(paths.html)
          .pipe(cb())
          .pipe(gulp.dest(paths.build));
    });


    /**
     * Compiles LESS files.
     */
    gulp.task('less', [ 'clean' ], function() {
      gutil.log(util.format('Compiling %s to %s',
          gutil.colors.magenta(paths.less), gutil.colors.magenta(paths.build)));
      return gulp.src(paths.less)
        .pipe(plumber(function(err) {
          gutil.log(gutil.colors.red(err.toString()));
        }))
        .pipe(less({ compress: env !== 'dev' }))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest(paths.build));
    });

    /**
     * Compiles Javascript.
     */
    gulp.task('js', [ 'clean' ], function() {
      gutil.log(util.format('Compiling %s to %s',
          gutil.colors.magenta(paths.js), gutil.colors.magenta(paths.build)));
      return gulp.src(paths.js)
        .pipe(plumber(function(err) {
          gutil.log(gutil.colors.red(err.toString()));
        }))
        .pipe(browserify())
        .pipe(gif(env !== 'dev', uglify()))
        .pipe(gulp.dest(paths.build));
    });

    /**
     * Copies static assets.
     */
    gulp.task('assets', [ 'clean' ], function() {
      gutil.log(util.format('Copying %s to %s',
          gutil.colors.magenta(paths.assets), gutil.colors.magenta(paths.build)));
      return gulp.src(paths.assets, { base: paths.src })
          .pipe(gulp.dest(paths.build));
    });
  }
};