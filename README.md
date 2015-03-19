# Syrup

Syrup is a collection of shared UI utilities and libraries leveraged by [AI2](http://github.com/allenai) when developing interfaces.

## Installation

Install via `npm`:

```shell
npm install syrup
```

## API

### function(gulp, options, configParameters, paths)

```javascript
/**
 * Registers default gulp tasks.
 *
 * @param {object}  gulp                          The gulp library.
 * @param {object}  options                       Optional object definining configuration
 *                                                parameters.
 * @param {object}  options.compressJs            If true javascript will be minified. Defaults
 *                                                to true. This causes the build to become
 *                                                significantly slower.
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
 *                                                gulpfile itself lives.  Defaults to the current
 *                                                working directory.
 * @param {string}  paths.html                    Path to the project's HTML files which should
 *                                                be copied into the output directory.
 * @param {string}  paths.jshint                  Path to the javascript files which should be
 *                                                linted using jshint.
 * @param {string}  paths.js                      Javascript entry point. It and all dependencies
 *                                                loaded via require() will be bundled into
 *                                                a single javascript file of the same name.
 * @param {string}  paths.allLess                 Path to all less files which will be watched
 *                                                for changes and cause less re-compilation as
 *                                                changes occur.
 * @param {string}  paths.less                    The less entry-point.  The less file and it's
 *                                                dependencies (specified using @import) will
 *                                                be compiled into a single static css file of
 *                                                the same name.
 * @param {string}  paths.assets                  Path to the project's static assets (images,
 *                                                fonts, etc).
 * @param {string}  paths.build                   Path to the project's build directory where the
 *                                                output should be placed.
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
