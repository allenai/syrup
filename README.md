# Syrup

Syrup is a collection of shared UI utilities and libraries leveraged by [AI2](http://github.com/allenai) when developing interfaces.

## Installation

Install via `npm`:

```shell
npm install syrup
```

## API

### syrup.gulp.init(gulp, [options, configParameters, paths])

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
 * @param {boolean} [options.disableJsHint=false]       Disables jshint.  Defaults to false.
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
 * @param {string}  paths.jshint                        Path to the javascript files which should
 *                                                      be linted using jshint.
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

The default paths are as follows.

```javascript
{
  base: process.cwd(),
  html: 'app/index.html',
  allLess: 'app/**/*.less',
  less: 'app/main.less',
  jshint: 'app/**/*.js',
  js: 'app/app.js',
  assets: 'app/assets/**/*',
  build: 'build'
}
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
