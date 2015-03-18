'use strict';

var cb = require('gulp-cache-breaker');
var fs = require('fs');
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var del = require('del');
var gutil = require('gulp-util');
var gif = require('gulp-if');
var jshint = require('gulp-jshint');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var karma = require('karma');
var pesto = require('pesto');
var stylish = require('jshint-stylish');
var util = require('util');
var path = require('path');
var Buffer = require('buffer').Buffer;
var replace = require('gulp-replace');
var stringify = require('stringify');
var server = require('../server');
var merge = require('../merge');
var defaultPaths = require('./default-paths');

module.exports = {
  /**
   * Registers default gulp tasks.
   *
   * @param {object}  gulp                          The gulp library.
   * @param {object}  options                       Optional object definining configuration
   *                                                parameters.
   * @param {object}  options.compressJs            If true javascript will be minified. Defaults
   *                                                to true.
   * @param {object}  options.sourceMaps            Enables javascript source maps. Defaults to
   *                                                true.
   * @param {object}  options.compressCss           If true styles will be compressed. Defaults to
   *                                                true.
   * @param {object}  configParameters              Optional map of configuration keys. If set each
   *                                                key is searched for in the html contents of the
   *                                                application and replaced with the corresponding
   *                                                value.
   * @param {object}  paths                         Optional object defining paths relevant to the
   *                                                project. If not specified the defaults are used.
   * @param {string}  paths.base                    The base directory of your project where the
   *                                                gulpfile itself lives.  Defaults to
   *                                                process.cwd().
   * @param {string}  paths.src                     Path to the application's source files.
   * @param {string}  paths.html                    Path to the project's HTML files.
   * @param {string}  paths.jshint                  Path to javascript files which should be linted
   *                                                using jshint.
   * @param {string}  paths.js                      Path to javascript files to be bundled using
   *                                                browserify.
   * @param {string}  paths.less                    Path to the project's less files.
   * @param {string}  paths.assets                  Path to the project's assets.
   * @param {string}  paths.fonts                   Path to the project's fonts.
   * @param {string}  paths.build                   Path to the project's build directory where the
   *                                                final output should be placed.
   * @param {string}  paths.tmp                     Path where temporary files should be put.
   * @param {string}  paths.watch                   Path to the files which should be watched for
   *                                                changes while the griddle serve is running and
   *                                                trigger a rebuild as changes occur.
   * @param {string}  paths.unitTests               Path to the project's unit tests. These files
   *                                                are browserified to paths.tmp prior to execution
   * @param {string}  paths.unitTestConfig          Path to the project's karma configuration file.
   * @param {string}  paths.integrationTestConfig   Path to the project's pesto / protractor
   *                                                configuration file.
   * @returns {undefined}
   */
  init: function(gulp, options, configParameters, paths) {
    // Produce paths by merging any user specified paths with the defaults.
    paths = merge(defaultPaths, paths);

    if (typeof options !== 'object') {
      options = {};
    }
    if (options.silent === true) {
      gutil.log = gutil.noop;
    }

    if (!gulp || typeof gulp.task !== 'function') {
      throw 'Invalid gulp instance';
    }

    if (!paths || typeof paths !== 'object') {
      throw 'Invalid paths';
    }

    /**
     * Removes all build artifacts.
     */
    gulp.task('clean', function(cb) {
      gutil.log(util.format('Removing artifacts from %s',
          gutil.colors.magenta(paths.build)));
      var targets = [ paths.build ];
      if (paths.tmp) {
        targets.push(paths.tmp);
      }
      return del(targets, { force: true }, cb);
    });

    /**
     * Compiles less files to css.
     */
    gulp.task('less', function() {
      gutil.log(util.format('Compiling %s to %s',
          gutil.colors.magenta(paths.less), gutil.colors.magenta(paths.build + paths.less)));
      return gulp.src(paths.less)
        .pipe(less({ compress: options.compressCss !== false }))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest(paths.build));
    });

    /**
     * Lints javascript
     */
    gulp.task('jslint', function() {
      gutil.log(util.format('Linting %s', gutil.colors.magenta(paths.jshint)));
      return gulp.src(paths.jshint)
        .pipe(jshint(path.resolve(__dirname, '../.jshintrc')))
        .pipe(jshint.reporter(stylish));
    });

    /**
     * Bundles, compresses and produces sourcemaps for javascript.
     */
    gulp.task('js', function() {
      // TODO: Currently this means glob based patterns aren't supported.
      var filename = path.basename(paths.js);

      gutil.log(
        util.format(
          'Compiling %s to %s',
          gutil.colors.magenta(paths.js),
          gutil.colors.magenta(path.resolve(paths.build, filename))
        )
      );

      var bundler = browserify({ debug: options.sourceMaps, detectGlobals: false });
      bundler.transform(stringify({ extensions: ['.html'], minify: true }));
      // Browserify can't handle purely relative paths, so resolve the path for them...
      bundler.add(path.resolve(paths.base, paths.js));
      bundler.on('error', gutil.log.bind(gutil, 'Browserify Error'));

      return bundler.bundle()
        .pipe(source(path.basename(paths.js)))
        .pipe(buffer())
        .pipe(gif(options.sourceMaps !== false, sourcemaps.init({ loadMaps: true })))
        .pipe(gif(options.compressJs !== false, uglify()))
        .pipe(gif(options.sourceMaps !== false, sourcemaps.write('./')))
        .pipe(gulp.dest(paths.build));
    });

    /**
     * Copies static assets.
     */
    gulp.task('assets', function() {
      gutil.log(
        util.format(
          'Copying %s to %s',
          gutil.colors.magenta(paths.assets),
          gutil.colors.magenta(paths.build)
        )
      );
      return gulp.src(paths.assets, { base: paths.src })
          .pipe(gulp.dest(paths.build));
    });

    /**
     * Copies all html files to the build directory.
     */
    gulp.task('html', [ 'js', 'less', 'assets' ], function() {
      gutil.log(util.format('Copying %s to %s',
          gutil.colors.magenta(paths.html), gutil.colors.magenta(paths.build)));
      return gulp.src(paths.html)
          .pipe(cb(paths.build))
          .pipe(gulp.dest(paths.build));
    });

    /**
     * Bundles all unit tests into a single file for testing.
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
        configFile: path.resolve(paths.base, paths.base, paths.unitTestConfig),
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
              if (passed) {
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
      if (paths.watch) {
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

    /**
     * Sets configuration data.
     */
    gulp.task('set-config', ['html'], function() {
      if (configParameters) {
        var configKeys = Object.getOwnPropertyNames(configParameters || {});
        var reConfigKeys = new RegExp('(?:' + configKeys.join('|') + ')', 'g')
        return gulp.src(path.resolve(paths.build, path.basename(paths.html)))
          .pipe(replace(reConfigKeys, function(key) {
            return configParameters[key] || '';
          }))
          .pipe(gulp.dest(paths.build));
      } else {
        gutil.log(gutil.colors.yellow('No configuration parameters provided.'));
      }
    });

    /**
     * Watches specific files and rebuilds only the changed component(s).
     */
    gulp.task('watch', ['build'], function() {
      gulp.watch(config.paths.js, ['jslint', 'js', 'html', 'set-config']);
      gulp.watch(config.paths.allLess, ['less', 'html', 'set-config']);
      gulp.watch(config.paths.assets, ['assets', 'html', 'set-config']);
      gulp.watch(config.paths.html, ['html', 'set-config']);
    });

    /**
     * Combined build task. This bundles up all required UI resources.
     */
    gulp.task('build', ['clean'], function() {
      return gulp.start(['assets', 'jslint', 'js', 'less', 'html', 'set-config']);
    });

    /**
     * Default task. Gets executed when gulp is called without arguments.
     */
    gulp.task('default', ['build']);
  }
};