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
var watchify = require('watchify');
var merge = require('../merge');
var defaultPaths = require('./default-paths');

/**
 * @private
 * Returns the top most directory in the specified path, removing any glob style wildcards (*).
 *
 * @param {string} p The full path
 *
 * @returns {string} The top most directory found.  For instance, returns "asdf" if given
 *                   "/foo/bar/asdf".
 */
var topDirectory = function(p) {
  return p.split(path.sep).filter(function(part) {
    return part.indexOf('*') === -1;
  }).pop();
};

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
   * @param {string}  paths.html                    Path to the project's HTML files.
   * @param {string}  paths.jshint                  Path to javascript files which should be linted
   *                                                using jshint.
   * @param {string}  paths.js                      Path to javascript files to be bundled using
   *                                                browserify.
   * @param {string}  paths.less                    Path to the project's less files.
   * @param {string}  paths.assets                  Path to the project's assets.
   * @param {string}  paths.build                   Path to the project's build directory where the
   *                                                final output should be placed.
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

    // Shared bundler used both by the 'js' task and the 'watch' task for bundling javascript
    // resources
    var bundler = watchify(browserify({
      debug: options.sourceMaps,
      detectGlobals: false,
      cache: {},
      packageCache: {},
      fullPaths: true
    }));
    bundler.transform(stringify({ extensions: ['.html'], minify: true }));
    // Browserify can't handle purely relative paths, so resolve the path for them...
    bundler.add(path.resolve(paths.base, paths.js));
    bundler.on('error', gutil.log.bind(gutil, 'Browserify Error'));

    // Helper method for copying html, see 'html-only' and 'html' tasks.
    var copyHtml = function() {
      gutil.log(util.format('Copying %s to %s',
          gutil.colors.magenta(paths.html), gutil.colors.magenta(paths.build)));
      return gulp.src(paths.html)
          .pipe(cb(paths.build))
          .pipe(gulp.dest(paths.build));
    };

    /**
     * Removes all build artifacts.
     */
    gulp.task('clean', function(cb) {
      gutil.log(util.format('Removing artifacts from %s',
          gutil.colors.magenta(paths.build)));
      var targets = [ paths.build ];
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
      var fn = path.basename(paths.js);
      gutil.log(
        util.format(
          'Compiling %s to %s',
          gutil.colors.magenta(paths.js),
          gutil.colors.magenta(path.resolve(paths.build, fn))
        )
      );
      return bundler.bundle()
        .pipe(source(fn))
        .pipe(buffer())
        .pipe(gif(options.sourceMaps !== false, sourcemaps.init({ loadMaps: true })))
        .pipe(gif(options.compressJs !== false, uglify()))
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
      var dest = paths.build + path.sep + assetDir;
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
      var dest = paths.build + path.sep + assetDir;
      gutil.log(
        util.format(
          'Copying %s to %s',
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
    gulp.task('watch', ['build'], function(cb) {
      var b = getBundler();
      // A file has been updated.  Create a bundle, then update the HTML file with the
      // latest cache-broken js link
      b.on('update', function() {
        gulp.start('html-js');
      });
      gulp.watch(paths.allLess, ['html-less', 'set-config']);
      gulp.watch(paths.assets, ['html-assets', 'set-config']);
      gulp.watch(paths.html, ['html-only', 'set-config']);
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