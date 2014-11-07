'use strict';

var cb = require('gulp-cache-breaker');
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var del = require('del');
var gutil = require('gulp-util');
var gif = require('gulp-if');
var jshint = require('gulp-jshint');
var karma = require('karma');
var pesto = require('pesto');
var stylish = require('jshint-stylish');
var util = require('util');
var path = require('path');
var stringify = require('stringify');
var server = require('../server');

module.exports = {
  /**
   * Registers several default gulp tasks.
   *
   * @param {object}  gulp                          The gulp library.
   * @param {object}  paths                         An object defining a series of paths required
   *                                                for the various tasks.
   * @param {string}  paths.base                    The base path to the project.
   * @param {string}  paths.html                    Path to the project's HTML files.
   * @param {string}  paths.js                      Path to the project's JS files.
   * @param {string}  paths.less                    Path to the project's LESS files.
   * @param {string}  paths.assets                  Path to the project's assets.
   * @param {string}  paths.build                   Path to the project's build directory where the
   *                                                final output should be placed.
   * @param {string}  paths.tmp                     Path where temporary files (like browserified)
   *                                                unit tests should be put.
   * @param {string}  paths.watch                   Path to the files which should be watched for changes
   *                                                while the griddle serve is running and trigger
   *                                                a rebuild as changes occur.
   * @param {string}  paths.unitTests               Path to the project's unit tests.  These files are
   *                                                browserified to paths.tmp prior to execution
   * @param {string}  paths.unitTestConfig          Path to the project's karma configuration file.
   * @param {string}  paths.integrationTestConfig   Path to the project's pesto / protractor
   *                                                configuration file.
   * @param {string}  env                           An enviroment flag. Valid values are 'dev'
   *                                                and 'prod'.
   * @param {boolean} [silent=false]                Optional boolean which silences log output if
   *                                                set to true.  Defaults to false.
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
      var targets = [ paths.build ];
      if(paths.tmp) {
        targets.push(paths.tmp);
      }
      return del(targets, { force: true }, cb);
    });

    /**
     * Compiles LESS files.
     */
    gulp.task('less', [ 'clean' ], function() {
      gutil.log(util.format('Compiling %s to %s',
          gutil.colors.magenta(paths.less), gutil.colors.magenta(paths.build)));
      return gulp.src(paths.less)
        .pipe(less({ compress: env !== 'dev' }))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest(paths.build));
    });

    /**
     * Lints Javascript
     */
    gulp.task('jslint', function() {
      gutil.log(util.format('Linting %s', gutil.colors.magenta(paths.js)));
      return gulp.src(paths.js)
        .pipe(jshint(path.resolve(__dirname, '../.jshintrc')))
        .pipe(jshint.reporter(stylish));
    });

    /**
     * Compiles Javascript.
     */
    gulp.task('js', [ 'clean' ], function() {
      gutil.log(util.format('Compiling %s to %s',
          gutil.colors.magenta(paths.js), gutil.colors.magenta(paths.build)));
      return gulp.src(paths.js, { read: false })
        .pipe(browserify({ transform: stringify({ extensions: ['.html'], minify: true }) }))
        .pipe(gif(env !== 'dev', uglify()))
        .pipe(gulp.dest(paths.build));
    });

    /**
     * Copies static assets.
     */
    gulp.task('assets', [ 'clean' ], function() {
      // Remove any * characters from the pattern and derive the directory name as
      // this will preserve the root path to the assets themselves which is likely
      // ideal.
      // TODO: Another option would be to configure this via an optional path (path.assetBase ore
      // something akin to that).  This way the user could toggle this behavior
      var base = path.dirname(path.resolve(paths.assets.replace(/\*/g, '')));
      gutil.log(util.format('Copying %s to %s',
          gutil.colors.magenta(paths.assets), gutil.colors.magenta(paths.build)));
      return gulp.src(paths.assets, { base: base })
          .pipe(gulp.dest(paths.build));
    });

    /**
     * Copies all html files to the build directory.
     */
    gulp.task('html', [ 'clean', 'js', 'less', 'assets' ], function() {
      gutil.log(util.format('Copying %s to %s',
          gutil.colors.magenta(paths.html), gutil.colors.magenta(paths.build)));
      return gulp.src(paths.html)
          .pipe(cb(paths.build))
          .pipe(gulp.dest(paths.build));
    });

    /**
     * Combines all unit tests into a single file for testing.
     */
    gulp.task('browserify-unit-tests', function() {
      return gulp.src(paths.unitTests, { read: false })
        .pipe(browserify())
        .pipe(gulp.dest(paths.tmp));
    });

    /**
     * Run project unit tests using Karma.
     */
    gulp.task('run-unit-tests', ['browserify-unit-tests'], function(done) {
      karma.server.start({
        // Karma needs an absolute path to the configuration file so attempt to resolve
        configFile: path.resolve(process.cwd(), paths.base, paths.unitTestConfig),
        singleRun: true
      }, done);
    });

    /**
     * Run integration tests using Pesto
     */
    gulp.task('run-integration-tests', function(done) {
      // We don't need to build since griddle does it for us.
      server.start({ base: paths.base, serve: paths.build }).then(
        function() {
          pesto(paths.integrationTestConfig).then(function(passed) {
            server.stop().then(function() {
              if(passed) {
                done();
              } else {
                done(false);
              }
            });
          });
        }
      );
    });

    /**
     * Combined test task which executes both the unit and integration tests
     */
    gulp.task('test', ['run-unit-tests', 'run-integration-tests']);

    /**
     * Task for starting a griddle + express based HTTP server.
     */
    gulp.task('start-server', function(done) {
      var opts = { base: paths.base, serve: paths.build };
      if(paths.watch) {
        opts.watch = paths.watch;
      }
      server.start(opts).then(
        function(event) {
          gutil.log('Server listening: ' + gutil.colors.magenta(event.data));
          done();
        },
        function(e) {
          gutil.log(gutil.colors.red(e));
          done();
        }
      );
    });
  }
};