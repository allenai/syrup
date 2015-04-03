'use strict';

var cb = require('gulp-cache-breaker');
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
var stylish = require('jshint-stylish');
var util = require('util');
var path = require('path');
var replace = require('gulp-replace');
var stringify = require('stringify');
var watchify = require('watchify');
var merge = require('../merge');
var plumber = require('gulp-plumber');
var defaultPaths = require('./default-paths');
var runSequence = require('run-sequence');

/**
 * @private
 * Returns the top most directory in the specified path, removing any glob style wildcards (*).
 *
 * @param {string} p The full path
 *
 * @returns {string} The top most directory found.  For instance, returns "asdf" if given
 *                   "/foo/bar/asdf".
 */
function topDirectory(p) {
  return p.split(path.sep).filter(function(part) {
    return part.indexOf('*') === -1;
  }).pop();
}

/**
 * @private
 * Outputs error messages and stops the stream.
 */
function logErrorAndKillStream(error) {
  gutil.log(gutil.colors.red('Error:'), error.toString());
  this.emit('end');
}

/**
 * @private
 * Returns the time difference between start and now nicely formatted for output.
 */
function formattedTimeDiff(start) {
  var diff = Date.now() - start;
  if (diff < 1000) {
    diff = diff + 'ms';
  } else {
    diff = diff / 1000;
    if (diff > 60) {
      diff = diff / 60 + 'm';
    } else {
      diff += 's';
    }
  }
  return gutil.colors.yellow(diff);
}

/**
 * @private
 * Logs a message indicating that the build is complete.
 */
function outputBuildCompleteMessage(start) {
  gutil.log(gutil.colors.green('Build finished successfully in ') + formattedTimeDiff(start));
}

module.exports = {
  /**
   * Registers default gulp tasks.
   *
   * @param {object}  gulp                                The gulp library.
   * @param {object}  [options]                           Optional object definining configuration
   *                                                		  parameters.
   * @param {boolean} [options.compressJs=true]           If true javascript will be minified. Defaults
   *                                                		  to true. This causes the build to become
   *                                                			significantly slower.
   * @param {boolean} [options.sourceMaps=true]           Enables javascript source maps. Defaults to
   *                                                    	true.
   * @param {boolean} [options.compressCss=true]          If true styles will be compressed. Defaults to
   *                                                		  true.
   * @param {boolean} [options.detectGlobals=false]       Enables browserify global detection (and
   *                                                		  inclusion).  This is necessary for certain
   *                                                			npm packages to work when bundled for front-end
   *                                                			inclusion.  Defaults to false.  Enabling this
   *                                                			may slow down your build.
   * @param {boolean} [options.insertGlobals=false]       Enables automatic insertion of node globals
   *                                                	   	when preparing a javascript bundler.  Faster
   *                                                			alternative to detectGlobals but causes the
   *                                                			javascript file to include an extra 1000 lines
   *                                                			of nodejs globals with every build.  Defaults
   *                                                			to false.
   * @param {boolean} [options.disableJsHint=false]       Disables jshint.  Defaults to false.
   * @param {boolean} [options.handleExceptions=false]    If an exception is encountered while compiling
   *                                                      less or bundling javascript, don't break the
   *                                                      build -- just output the associatd error.
   *                                                      Defaults to false.
   * @param {string}  [options.jsOut]                     Overrides the default filename for the
   *                                                      bundled js file.  Defaults to the same
   *                                                      filename as the js entry point (i.e. if
   *                                                      paths.js is set to "app/app.js" the
   *                                                      bundled file will be "build/app.js").
   * @param {object}  [configParameters]                  Optional map of configuration keys. If set each
   *                                                    	key is searched for in the html contents of the
   *                                                     	application and replaced with the corresponding
   *                                                      value.
   * @param {object}  [paths]                             Optional object defining paths relevant to the
   *                                                    	project. If not specified the defaults are used.
   * @param {string}  paths.base                          The base directory of your project where the
   *                                                    	gulpfile itself lives.  Defaults to the current
   *                                                     	working directory.
   * @param {string}  paths.html                          Path to the project's HTML files which should
   *                                                    	be copied into the output directory.
   * @param {string}  paths.jshint                        Path to the javascript files which should be
   *                                                    	linted using jshint.
   * @param {string}  paths.js                            Javascript entry point. It and all dependencies
   *                                                    	loaded via require() will be bundled into
   *                                                     	a single javascript file of the same name.
   * @param {string}  paths.allLess                       Path to all less files which will be watched
   *                                                      for changes and cause less re-compilation as
   *                                                      changes occur.
   * @param {string}  paths.less                          The less entry-point.  The less file and it's
   *                                                      dependencies (specified using @import) will
   *                                                      be compiled into a single static css file of
   *                                                      the same name.
   * @param {string}  paths.assets                        Path to the project's static assets (images,
   *                                                      fonts, etc).
   * @param {string}  paths.build                         Path to the project's build directory where the
   *                                                      output should be placed.
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

    // Support --builddir or --target as an override for the build directory.
    // TODO: Document this.  Should also provide the ability to pass all options and/or paths
    // via command flags, ie. gulp --paths.build=../public build
    if (gutil.env.builddir || gutil.env.target) {
      paths.build = gutil.env.builddir || gutil.env.target;
    }

    // Helper function to get browserify bundler used both by the 'js' task and the 'watch' task
    var bundlerInstance;
    var bundler = function(watch) {
      if (!bundlerInstance) {
        var b = browserify({
          debug: options.sourceMaps !== false,
          detectGlobals: options.detectGlobals,
          insertGlobals: options.insertGlobals,
          cache: {},
          packageCache: {},
          fullPaths: true /* Required for source maps */
        });
        if (watch) {
          bundlerInstance = watchify(b, { delay: 1 });
          bundlerInstance.on('update', function() {
            var start = Date.now();
            gutil.log(gutil.colors.yellow('Javascript change detected'));
            gulp.start('html-js', function() {
              outputBuildCompleteMessage(start);
            });
          });
        } else {
          bundlerInstance = b;
        }
        bundlerInstance.transform(stringify({ extensions: ['.html'], minify: true }));
        // Browserify can't handle purely relative paths, so resolve the path for them...
        bundlerInstance.add(path.resolve(paths.base, paths.js));
        bundlerInstance.on('error', gutil.log.bind(gutil, 'Browserify Error'));
      }
      return bundlerInstance;
    };

    // Helper method for copying html, see 'html-only' and 'html' tasks.
    var copyHtml = function() {
      gutil.log(
        util.format(
          'Copying html: %s to %s',
          gutil.colors.magenta(paths.html),
          gutil.colors.magenta(paths.build)
        )
      );
      var hasConfig = typeof configParameters === 'object';
      var configKeys = Object.getOwnPropertyNames(configParameters || {});
      var reConfigKeys = new RegExp('(?:' + configKeys.join('|') + ')', 'g');
      var replaceConfigKeys = replace(reConfigKeys, function(key) {
        return configParameters[key] || '';
      });
      return gulp.src(paths.html)
        .pipe(cb(paths.build))
        .pipe(gif(hasConfig, replaceConfigKeys))
        .pipe(gulp.dest(paths.build));
    };

    /**
     * Removes all build artifacts.
     */
    gulp.task('clean', function(cb) {
      gutil.log(util.format('Cleaning: %s', gutil.colors.magenta(paths.build)));
      var targets = [ paths.build ];
      return del(targets, { force: true }, cb);
    });

    /**
     * Compiles less files to css.
     */
    gulp.task('less', function() {
      gutil.log(util.format('compiling less to css: %s to %s',
          gutil.colors.magenta(paths.less), gutil.colors.magenta(paths.build + paths.less)));
      return gulp.src(paths.less)
        .pipe(gif(options.handleExceptions, plumber(logErrorAndKillStream)))
        .pipe(less({ compress: options.compressCss !== false }))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest(paths.build));
    });

    /**
     * Lints javascript
     */
    gulp.task('jslint', function() {
      if (!options.disableJsHint) {
        gutil.log(util.format('Linting javascript: %s', gutil.colors.magenta(paths.jshint)));
        return gulp.src(paths.jshint)
          .pipe(jshint(path.resolve(__dirname, '../.jshintrc')))
          .pipe(jshint.reporter(stylish));
      } else {
        gutil.log(
          gutil.colors.yellow(
            'Javascript linting skipped'
          )
        );
      }
    });

    /**
     * Bundles, compresses and produces sourcemaps for javascript.
     */
    gulp.task('js', function() {
      var fn = options.jsOut || path.basename(paths.js);
      gutil.log(
        util.format(
          'Bundling javascript: %s to %s',
          gutil.colors.magenta(paths.js),
          gutil.colors.magenta(path.relative(process.cwd(), path.resolve(paths.build, fn)))
        )
      );
      return gif(options.handleExceptions, plumber(logErrorAndKillStream))
        .pipe(bundler().bundle())
        .pipe(source(fn))
        .pipe(buffer())
        .pipe(gif(options.sourceMaps !== false, sourcemaps.init({ loadMaps: true })))
        .pipe(gif(options.compressJs !== false, uglify({ compress: { 'drop_debugger': false } })))
        .pipe(gif(options.sourceMaps !== false, sourcemaps.write('./')))
        .pipe(gulp.dest(paths.build));
    });

    /**
     * Copies fonts and icons into the assets directory.
     *
     * This task first copies user-assets, then pipes syrup based assets (currently /fonts
     * and /icons into the asset directory).
     */
    gulp.task('assets', ['user-assets'], function() {
      var assetDir = topDirectory(paths.assets);
      var dest = path.relative(process.cwd(), path.resolve(paths.build, assetDir));
      var iconAndFontBase = path.resolve(__dirname, '..');
      var iconsAndFontPaths = [
        path.resolve(iconAndFontBase, 'fonts', '**', '*'),
        path.resolve(iconAndFontBase, 'icons', '**', '*'),
      ];
      return gulp.src(iconsAndFontPaths, { base: iconAndFontBase })
        .pipe(gulp.dest(dest));
    });

    /**
     * Copies user specific assets.
     */
   gulp.task('user-assets', function() {
      var assetDir = topDirectory(paths.assets);
      var dest = path.relative(process.cwd(), path.resolve(paths.build, assetDir));
      gutil.log(
        util.format(
          'Copying static assets: %s to %s',
          gutil.colors.magenta(paths.assets),
          gutil.colors.magenta(dest)
        )
      );
      return gulp.src(paths.assets)
        .pipe(gulp.dest(dest));
    });

    /**
     * The following html gulp tasks are for use with gulp.watch.  Each is tied to particular
     * dependency.
     */
    gulp.task('html-only', copyHtml);
    gulp.task('html-js', [ 'js' ], copyHtml);
    gulp.task('html-less', [ 'less' ], copyHtml);
    gulp.task('html-assets', [ 'assets' ], copyHtml);

    /**
     * Copies all html files to the build directory.
     */
    gulp.task('html', [ 'js', 'less', 'assets'], copyHtml);

    /**
     * Watches specific files and rebuilds only the changed component(s).
     */
    gulp.task('watch', function() {
      options.handleExceptions = true;
      bundler(true);
      gulp.start('build', function() {
        gulp.watch(paths.allLess, function() {
          var start = Date.now();
          gutil.log(gutil.colors.yellow('Less change detected'));
          gulp.start('html-less', function() {
            outputBuildCompleteMessage(start);
          });
        });

        gulp.watch(paths.assets, function() {
          var start = Date.now();
          gutil.log(gutil.colors.yellow('Asset change detected'));
          gulp.start('html-assets', function() {
            outputBuildCompleteMessage(start);
          });
        });

        gulp.watch(paths.html, function() {
          var start = Date.now();
          gutil.log(gutil.colors.yellow('HTML change detected'));
          gulp.start('html-only', function() {
            outputBuildCompleteMessage(start);
          });
        });
      });
    });

    /**
     * Combined build task. This bundles up all required UI resources.
     */
    gulp.task('build', function(cb) {
      var start = Date.now();
      runSequence(
        'clean',
        ['assets', 'jslint', 'js', 'less', 'html'],
        function() {
          cb();
          outputBuildCompleteMessage(start);
        }
      );
    });

    /**
     * Default task. Gets executed when gulp is called without arguments.
     */
    gulp.task('default', ['build']);
  }
};