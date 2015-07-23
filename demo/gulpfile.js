var gulp = require('gulp');
var syrup = require('../');
var githubPages = require('gulp-gh-pages');

syrup.gulp.init(
  gulp,
  undefined,
  undefined,
  {
    html: 'app/index.html',
    jshint: 'app/main.js',
    js: 'app/main.js'
  }
);

gulp.task('deploy', ['build'], function() {
  return gulp.src('./build/**/*').pipe(githubPages({
    remoteUrl: 'git@github.com:allenai/syrup'
  }));
});
