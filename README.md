# Syrup

Syrup is a collection of shared UI utilities and libraries leveraged by [AI2](http://github.com/allenai) when developing interfaces.

## Installation

Install via `npm`:

```shell
npm install syrup
```

## API

### syrup.gulp.init(gulp, configParameters, configKeys, paths)

```javascript
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
syrup.gulp.init(gulp, options, configParameters, paths)
```

The default paths are as follows.

```javascript
{
  base: process.cwd(),
  src: 'app',
  html: 'app/index.html',
  allLess: 'app/**/*.less',
  less: 'app/main.less',
  jshint: 'app/**/*.js',
  js: 'app/app.js',
  assets: 'app/assets/**/*',
  fonts: 'node_modules/syrup/fonts/**/*',
  build: 'build',
  watch: 'app',
  tmp: 'tmp',
  unitTests: 'app/**/*-test.js',
  unitTestConfig: 'unit-tests.conf.js',
  integrationTestConfig: 'integration-tests.conf.js',
  integrationTests: 'integration-tests/**/*-it.js'
}
```

See [Karma](http://karma-runner.github.io/) for more on writing, configuring and running unit tests.

See [Pesto](https://github.com/allenai/pesto) for more on writing, configuring and running integration tests.

### syrup.server.start(options)

```javascript
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
```

A server can also be started using the gulp task, `start-server`:

```shell
gulp start-server
```

### syrup.server.stop()

```javascript
/**
 * Stops a server if there's one running.
 *
 * @returns {Promise} A promise which is resolved once the server is stopped.
 */
```

Example:

```javascript
var gulp = require('gulp');
var syrup = require('syrup');

syrup.gulp.init(gulp);
```

Now, from the command line run:

```
gulp build
```

## Default Styles

Example Use:

```css
@import '../../node_modules/syrup/less/syrup.less';
```

Included Stylesheets:

* `syrup/less/syrup.less`: A collection of less styles which include:
  * `syrup/less/colors.less`: Common colors.
  * `syrup/less/defaults.less`: Opinionated defaults.
  * `syrup/less/dimensions.less`: Variables related to standard site dimensions.
  * `syrup/less/functions.less`: Utility functions.
  * `syrup/less/icons.less`: Webfont icons.
  * `syrup/less/reset.less`: Browser style normalization.
  * `syrup/less/responsive.less`: Basic responsiveness for specified containers.
  * `syrup/less/text.less`: Typographic styles.

Colors:

The following colors are available upon including `colors.less`:

```less
/* ==========================================================================
   AI2 Brand Colors
   ========================================================================== */

@black: #202122;
@dark-blue: #286a8e;
@blue: #5ea5d9;
@gold: #fcb431;
@yellow: #fdea65;
@off-black: #3e4346;
@gray: #8c9296;
@light-blue: #bed2dd;
@light-gray: #e0e0e0;
@white: #fff;

@lighter-gray: lighten(@light-gray, 8%);
@lighter-blue: lighten(@light-blue, 12%);

@red: #a92020;
@green: #3fb62c;
@purple: #81288e;
@orange: #e26622;

@shadow: rgba(45,45,46,0.1);
@dark-shadow: rgba(45,45,46,0.2);
@translucent: rgba(255,255,255,.95);
```
