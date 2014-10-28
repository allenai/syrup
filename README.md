# Syrup

Syrup is a collection of shared UI utilities and libraries leveraged by [AI2](http://github.com/allenai) when developing interfaces.


## Gulp Tasks

  * `syrup.gulp.tasks(gulp, paths, env, silent)`: A collection of common gulp tasks used for developing interfaces.
    * `gulp` `{object}` A reference to the gulp instance you're using
    * `paths` `{object}` An object defining the various paths specific to your project.
    	* `paths.html` `{string}` Path to HTML files.
	    * `paths.less` `{string}` Path to LESS files.
	    * `paths.js` `{string}` Path to JS files.
	    * `paths.assets` `{string}` Path to static assets.
	    * `paths.build` `{string}` Path to the build directory.
	* `env` `{string}` Environment flag.  Either `'dev'` or `'prod'`.
	* `[silent=false]` `{boolean}` Optional boolean.  If true, no gulp log messages are output by the default tasks.

Example:

```javascript
var gulp = require('gulp');
var syrup = require('syrup');

syrup.gulp.tasks(
  gulp,
  {
    html: 'src/**/*.html',
    less: 'src/styles.less',
    js: 'src/main.js',
    assets: 'src/assets/**/*',
    build: 'build'
  }
  'dev',
);
```

## Default Styles

  * `syrup/less/syrup.less`: A collection of less styles which include:
    * `syrup/less/colors.less`: Common colors.
    * `syrup/less/dimensions.less`: Variables related to standard site dimensions.
    * `syrup/less/reset.less`: Browser style normalization.
    * `syrup/less/defaults.less`: Opinionated defaults.