
var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var assert = require('assert');
var syrup = require('../');

describe('syrup.gulp.tasks()', function() {
  var SAMPLE = path.resolve(__dirname, '../fixtures/project');

  var tasks = function() {
    syrup.gulp.tasks(gulp, require(SAMPLE + '/paths.js'), 'prod', true);
  };

  it('throws an exception without gulp', function() {
    assert.throws(syrup.gulp.tasks.bind(syrup.gulp.tasks), 'Invalid gulp instance');
    assert.throws(syrup.gulp.tasks.bind(syrup.gulp.tasks, {}), 'Invalid gulp instance');
  });

  it('throws an exception without a valid paths instance', function() {
    assert.throws(syrup.gulp.tasks.bind(syrup.gulp.tasks, gulp), 'Invalid paths');
  });

  it('moves html', function(done) {
    syrup.gulp.tasks(gulp, require(SAMPLE + '/paths.js'), 'prod', true);;
    gulp.start('html', function() {
      assert(fs.existsSync(path.resolve(SAMPLE, 'build', 'foo.html')));
      done();
    });
  });

  it('breaks the cache', function(done) {
    syrup.gulp.tasks(gulp, require(SAMPLE + '/paths.js'), 'prod', true);;
    gulp.start('html', function() {
      assert(fs.readFileSync(path.resolve(SAMPLE, 'build', 'foo.html'))
            .toString()
            .indexOf('/foo.js?cb=') !== -1);
      done();
    });
  });

  it('compiles less', function(done) {
    syrup.gulp.tasks(gulp, require(SAMPLE + '/paths.js'), 'prod', true);;
    gulp.start('less', function() {
      assert(fs.existsSync(path.resolve(SAMPLE, 'build', 'foo.css')));
      assert.equal(
          fs.readFileSync(path.resolve(SAMPLE, 'build', 'foo.css')).toString(),
          fs.readFileSync(path.resolve(SAMPLE, 'foo.expected.css')).toString()
        );
      done();
    });
  });

  it('combines js', function(done) {
    syrup.gulp.tasks(gulp, require(SAMPLE + '/paths.js'), 'prod', true);;
    gulp.start('js', function() {
      assert(fs.existsSync(path.resolve(SAMPLE, 'build', 'foo.js')));
      assert.equal(
          fs.readFileSync(path.resolve(SAMPLE, 'build', 'foo.js')).toString(),
          fs.readFileSync(path.resolve(SAMPLE, 'foo.expected.js')).toString()
        );
      done();
    });
  });

  it('copies js', function(done) {
    syrup.gulp.tasks(gulp, require(SAMPLE + '/paths.js'), 'prod', true);;
    gulp.start('js', function() {
      assert(fs.existsSync(path.resolve(SAMPLE, 'build', 'foo.js')));
      assert.equal(
          fs.readFileSync(path.resolve(SAMPLE, 'build', 'foo.js')).toString(),
          fs.readFileSync(path.resolve(SAMPLE, 'foo.expected.js')).toString()
        );
      done();
    });
  });

  it('copies assets', function(done) {
    syrup.gulp.tasks(gulp, require(SAMPLE + '/paths.js'), 'prod', true);;
    gulp.start('assets', function() {
      assert(fs.existsSync(path.resolve(SAMPLE, 'build', 'assets', 'foo.txt')));
      assert.equal(
          fs.readFileSync(path.resolve(SAMPLE, 'build', 'assets', 'foo.txt')).toString(),
          fs.readFileSync(path.resolve(SAMPLE, 'src', 'assets', 'foo.txt')).toString()
        );
      done();
    });
  });

  it('cleans up', function(done) {
    syrup.gulp.tasks(gulp, require(SAMPLE + '/paths.js'), 'prod', true);;
    gulp.start('assets', 'js', 'less', 'html', function() {
      assert(fs.readdirSync(path.resolve(SAMPLE, 'build')).length !== 0);
      gulp.start('clean', function() {
        assert(fs.readdirSync(path.resolve(SAMPLE, 'build')).length === 0);
        done();
      });
    });
  });

});
