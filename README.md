# Syrup

A collection of shared UI utilities and libraries leveraged by [AI2](http://github.com/allenai) when developing interfaces.

Specifically, syrup provides:

* A series of [gulp](http://gulpjs.com) tasks for building a single-page client-side application.
* A collection of [less](http://lesscss.org) styles.  To see them in action, visit the [demo](http://allenai.github.io/syrup).

## Installation

Install via [npm](http://npmjs.org):

```shell
npm install syrup
```

## Gulp

Syrup includes a series of gulp tasks useful for building a single-page client-side application.

The [gulp tasks](#gulp-tasks) provided by syrup can be initialized like so in your `gulpfile.js`:

```javascript
// gulpfile.js
var gulp = require('gulp');
var syrup = require('syrup');

syrup.gulp.init(gulp);
```

A build can then be triggered from the terminal:

```
gulp build
```

Watch your project for changes dynamically and start a static HTTP server for previewing the result:

```
gulp watch-and-serve
```

Read about all of the available [gulp tasks](#gulp-tasks), the default [project structure](#project-structure) or the full API offered by the [`syrup.gulp.init()`](#gulp-init).

## <a name="less"></a> LESS

To include the all of the less styles provide by syrup, simply add the following line to your less stylesheet:

```css
@import '../../node_modules/syrup/less/syrup.less';
```

## <a name="gulp-tasks"></a> Gulp Tasks

Syrup provides the following tasks:

- `clean`
 * Removes all build artifacts
* `less`
 * Compiles and minifies LESS files to CSS files.
* `jslint`
 * Lints JS files using [jshint](https://www.npmjs.com/package/gulp-jshint).
* `js`
 * Bundles, minifies and obfuscates `js` files using [browserify](http://browserify.org) into a single, bundled script.  Uses [babel](https://babeljs.io/) to provide support for ECMA6 features and [ReactJS](http://reactjs.com).
* `assets`
 * Copies all assets into the build directory.
* `html`
 * Copies the `index.html` file into the build directory after running the `js`, `assets`, and `less` tasks.
* `build`
 * Builds the project by running the `assets`, `jslint`, `js`, `less`, and `html` tasks.
* `watch`
 * Watches the project for changes and rebuilds the affected components as they occur.
* `serve`
 * Runs an [express](http://expressjs.com) HTTP serving serving the application.
* `watch-and-serve`
 * Runs the `watch` and `serve` tasks.

## <a name="project-structure"></a> Default Project Structure

The following project structure is expected by default, but can be changed via the `paths` parameter
of [`syrup.gulp.init()`](#gulp-init):

```javascript
{
  // the location of your application's index.html file
  html: 'app/index.html',
  // the less files which will be watched for changes
  allLess: 'app/**/*.less',
  // the less entry-point
  less: 'app/main.less',
  // all js files to be linted using eslint
  jsLint: 'app/**/*.js',
  // the js entry-point
  js: 'app/app.js',
  // static assets (images, fonts, etc)
  assets: 'app/assets/**/*',
  // the location of build output
  build: 'build'
}
```

## <a name="gulp-init"></a> Gulp API

```javascript
/**
 * Registers default gulp tasks.
 *
 * @param {object}  gulp                                The gulp library.
 * @param {object}  [options]                           Optional object definining configuration
 *                                                      parameters.
 * @param {boolean} [options.compressJs=true]           If true javascript will be minified.
 *                                                      Defaults to true. This causes the build
 *                                                      to become significantly slower.
 * @param {boolean} [options.sourceMaps=true]           Enables javascript source maps. Defaults
 *                                                      to true.
 * @param {boolean} [options.compressCss=true]          If true styles will be compressed.
 *                                                      Defaults to true.
 * @param {boolean} [options.detectGlobals=true]        Enables browserify global detection and
 *                                                      inclusion.  This is necessary for certain
 *                                                      npm packages to work when bundled for
 *                                                      front-end inclusion.  Defaults to true.
 * @param {boolean} [options.insertGlobals=false]       Enables automatic insertion of node
 *                                                      globals when preparing a javascript
 *                                                      bundler.  Faster alternative to
 *                                                      detectGlobals.  Causes an extra ~1000
 *                                                      lines to be added to the bundled
 *                                                      javascript.  Defaults to false.
 * @param {boolean} [options.disableJsLint=false]       Disables javascript linter. Defaults to false.
 * @param {boolean} [options.handleExceptions=false]    If an exception is encountered while
 *                                                      compiling less or bundling javascript,
 *                                                      capture the associated error and output
 *                                                      it cleanly. Defaults to false.
 * @param {string}  [options.jsOut]                     Overrides the default filename for the
 *                                                      resulting javascript bundle.  If not set
 *                                                      the javascript file will be the same name
 *                                                      as the entry point.
 * @param {boolean} [options.disableBabel=false]        Optionally disable babel, the es6 to es6
 *                                                      (and react JSX) transpiler.
 *                                                      See http://babeljs.io for more information.
 * @param {boolean} [options.enableStringify=false]     Optionally enable stringify, a browserify
 *                                                      transform that allows HTML files to be
 *                                                      included via require.
 * @param {number}  [options.port=4000]                 Optional port for the HTTP server started
 *                                                      via the serve task.  Defaults to 4000.
 * @param {object}  [configParameters]                  Optional map of configuration keys. If
 *                                                      set each key is searched for in the built
 *                                                      HTML and replaced with the corresponding
 *                                                      value.
 * @param {object}  [paths]                             Optional object defining paths relevant
 *                                                      to the project. Any specified paths are
 *                                                      merged with the defaults where these paths
 *                                                      take precedence.
 * @param {string}  paths.base                          The base directory of your project where
 *                                                      the gulpfile lives.  Defaults to the
 *                                                      current processes working directory.
 * @param {string}  paths.html                          Path to the project's HTML files.
 * @param {string}  paths.jsLint                        Path to the javascript files which should
 *                                                      be linted using eslint.
 * @param {string}  paths.js                            Javascript entry point.
 * @param {string}  paths.allLess                       Path matching all less files which should
 *                                                      be watched for changes.
 * @param {string}  paths.less                          The less entry-point.
 * @param {string}  paths.assets                        Path to the project's static assets.
 * @param {string}  paths.build                         Output directory where the build artifacts
 *                                                      should be placed.
 *
 * @returns {undefined}
 */
syrup.gulp.init(gulp, options, configParameters, paths)
```
