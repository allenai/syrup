# Syrup

Syrup is a collection of shared UI utilities and libraries leveraged by [AI2](http://github.com/allenai) when developing interfaces.

## Installation

Install via `npm`:

```shell
npm install syrup
```

## API

### syrup.gulp.tasks(gulp, paths, env, silent)

```javascript
/**
 * Registers several default gulp tasks.
 *
 * @param {object}  gulp                          The gulp library.
 * @param {object}  paths                         An object defining a series of paths required
 *                                                for the various tasks.

 * @param {string}  paths.html                    Path to the project's HTML files.
 * @param {string}  paths.js                      Path to the project's JS files.
 * @param {string}  paths.less                    Path to the project's LESS files.
 * @param {string}  paths.assets                  Path to the project's assets.
 * @param {string}  paths.build                   Path to the project's build directory where the
 *                                                final output should be placed.
 * @param {string}  paths.unitTests               Path to the project's unit tests.
 * @param {string}  paths.unitTestBundle          Path to the project's unit test bundle file.
 * @param {string}  paths.unitTestConfig          Path to the project's karma configuration file.
 * @param {string}  paths.integrationTestConfig   Path to the project's pesto / protractor
 *                                                configuration file.
 * @param {string}  env                           An environment flag. Valid values are 'dev'
 *                                                and 'prod'.
 * @param {boolean} [silent=false]                Optional boolean which silences log output if
 *                                                set to true.  Defaults to false.
 *
 * @returns {undefined}
 */
syrup.gulp.tasks(gulp, paths, env, silent)
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
 * @param {object}  options              Server options.
 * @param {object}  options.base         The base path to the project (where the gulpfile lives).
 * @param {boolean} options.watch        Optional boolean toggling whether the server should
 *                                       rebuild as changes are detected within the base path.
 * @param {string}  options.serve        The directory from which to serve static files.
 * @param {number}  [options.port=4000]  The port to listen on, defaults to 4000.
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
````

Example:

```javascript
var gulp = require('gulp');
var syrup = require('syrup');

syrup.gulp.tasks(
  gulp,
  {
    base: __dirname,
    html: 'src/**/*.html',
    less: 'src/styles.less',
    js: 'src/main.js',
    assets: 'src/assets/**/*',
    build: 'build',
    unitTests: 'src/**/*-test.js',
    unitTestBundle: 'tmp/unit-test-bundle.js',
    unitTestConfig: 'karma.conf.js'
    integrationTestConfig: 'protractor.conf.js',
  },
  'dev',
);
```

## Default Styles

  * `syrup/less/syrup.less`: A collection of less styles which include:
    * `syrup/less/colors.less`: Common colors.
    * `syrup/less/dimensions.less`: Variables related to standard site dimensions.
    * `syrup/less/reset.less`: Browser style normalization.
    * `syrup/less/defaults.less`: Opinionated defaults.

Example:

```css
@import '../../node_modules/syrup/less/syrup.less';
```