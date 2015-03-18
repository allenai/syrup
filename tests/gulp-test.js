
var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var assert = require('assert');
var del = require('del');
var syrup = require('../');

describe('syrup.gulp.init()', function() {

  var PROJECT_ROOT = path.resolve(__dirname, '../fixtures/project');
  var PROJECT_BUILD_DIR = path.resolve(PROJECT_ROOT, 'build');
  var ANOTHER_PROJECT_ROOT = path.resolve(__dirname, '../fixtures/another-project');
  var ANOTHER_PROJECT_BUILD_DIR = path.resolve(ANOTHER_PROJECT_ROOT, 'build');

  // Init the default project
  var initDefaultProject = function() {
    syrup.gulp.init(
      gulp,
      { silent: true },
      { MESSAGE: 'SOMEONE SET US UP', ANOTHER_MESSAGE: 'THE BOMB'},
      require(path.resolve(PROJECT_ROOT, 'paths.js'))
    );
  };

  // Remove any built files after each test is executed
  afterEach(function(cb) {
    var OUT = [ PROJECT_BUILD_DIR, ANOTHER_PROJECT_BUILD_DIR ];
    del(OUT, cb);
  });

  it('throws an exception without gulp', function() {
    initDefaultProject();
    assert.throws(syrup.gulp.init.bind(syrup.gulp.init), 'Invalid gulp instance');
    assert.throws(syrup.gulp.init.bind(syrup.gulp.init, {}), 'Invalid gulp instance');
  });

  it('uses the default paths if none are specified', function() {
    // Just make sure there's no exception, as there's no way to inspect paths
    syrup.gulp.init(gulp);
  });

  it('moves html', function(done) {
    initDefaultProject();
    gulp.start('html', function() {
      assert(fs.existsSync(path.resolve(PROJECT_BUILD_DIR, 'foo.html')));
      done();
    });
  });

  it('applies configuration parameters', function(done) {
    initDefaultProject();
    gulp.start('set-config', function() {
      assert(fs.existsSync(path.resolve(PROJECT_BUILD_DIR, 'foo.html')));
      var html = fs.readFileSync(path.resolve(PROJECT_BUILD_DIR, 'foo.html')).toString();
      assert(html.indexOf('SOMEONE SET US UP THE BOMB') !== -1);
      done();
    });
  });

  it('merges paths', function(done) {
    // Override the js path, but not the HTML path, but make sure we end up with both.
    syrup.gulp.init(
      gulp,
      { silent: true },
      undefined,
      {
        js: path.resolve(ANOTHER_PROJECT_ROOT, 'src', 'foo.js'),
        build: ANOTHER_PROJECT_BUILD_DIR
      }
    );
    gulp.start('html', function() {
      // Make sure we don't get any HTML (as it uses the default path), but that we do
      // get javascript.  This isn't the *best* test, but it'll do for now.
      assert(!fs.existsSync(path.resolve(ANOTHER_PROJECT_BUILD_DIR, 'index.html')));
      assert(fs.existsSync(path.resolve(ANOTHER_PROJECT_BUILD_DIR, 'app.js')));
      done();
    });
  });

  it('allows a task to be overriden', function(done) {
    initDefaultProject();
    gulp.task('html', ['less'], function() {
      // Do nothing (though still compile less)
    });
    gulp.start('html', function() {
      assert(fs.existsSync(path.resolve(PROJECT_BUILD_DIR, 'foo.css')));
      assert(!fs.existsSync(path.resolve(PROJECT_BUILD_DIR, 'foo.html')))
      done();
    });
  });

  it('breaks the cache with an actual SHA based on the content', function(done) {
    initDefaultProject();
    gulp.start('html', function() {
      assert(
        fs.readFileSync(path.resolve(PROJECT_BUILD_DIR, 'foo.html'))
          .toString()
          .indexOf('app.js?cb=d9b8d8d662f70b36da1ca185dc52e9a34dcdba9f') !== -1
      );
      done();
    });
  });

  it('compiles less', function(done) {
    initDefaultProject();
    gulp.start('less', function() {
      assert(fs.existsSync(path.resolve(PROJECT_BUILD_DIR, 'foo.css')));
      assert.equal(
          fs.readFileSync(path.resolve(PROJECT_BUILD_DIR, 'foo.css')).toString(),
          fs.readFileSync(path.resolve(PROJECT_ROOT, 'foo.expected.css')).toString()
        );
      done();
    });
  });

  it('allows css compression to be disabled', function(done) {
    syrup.gulp.init(
      gulp,
      { silent: true, compressCss: false },
      undefined,
      require(path.resolve(PROJECT_ROOT, 'paths.js'))
    );
    gulp.start('less', function() {
      fs.readFileSync(path.resolve(PROJECT_BUILD_DIR, 'foo.css')).toString(),
      fs.readFileSync(path.resolve(PROJECT_ROOT, 'foo.uncompressed.expected.css')).toString()
      done();
    });
  });

  it('combines js', function(done) {
    initDefaultProject();
    gulp.start('js', function() {
      assert(fs.existsSync(path.resolve(PROJECT_BUILD_DIR, 'app.js')));
      assert.equal(
          fs.readFileSync(path.resolve(PROJECT_BUILD_DIR, 'app.js')).toString(),
          fs.readFileSync(path.resolve(PROJECT_ROOT, 'app.expected.js')).toString()
        );
      done();
    });
  });

  it('copies assets', function(done) {
    initDefaultProject();
    gulp.start('assets', function() {
      assert(fs.existsSync(path.resolve(PROJECT_BUILD_DIR, 'assets', 'foo.txt')));
      assert.equal(
          fs.readFileSync(path.resolve(PROJECT_BUILD_DIR, 'assets', 'foo.txt')).toString(),
          fs.readFileSync(path.resolve(PROJECT_ROOT, 'src', 'assets', 'foo.txt')).toString()
        );
      done();
    });
  });

  it('allows js compression to be disabled', function(done) {
    syrup.gulp.init(
      gulp,
      { silent: true, compressJs: false },
      undefined,
      require(path.resolve(PROJECT_ROOT, 'paths.js'))
    );
    gulp.start('js', function() {
      assert(fs.existsSync(path.resolve(PROJECT_BUILD_DIR, 'app.js')));
      assert.equal(
          fs.readFileSync(path.resolve(PROJECT_BUILD_DIR, 'app.js')).toString(),
          fs.readFileSync(path.resolve(PROJECT_ROOT, 'app.uncompressed.expected.js')).toString()
        );
      done();
    })
  });

  it('produces sourcemaps', function(done) {
    initDefaultProject();
    gulp.start('js', function() {
      assert(fs.existsSync(path.resolve(PROJECT_BUILD_DIR, 'app.js.map')));
      done();
    });
  });

  it('allows sourcemaps to be disabled', function() {
    syrup.gulp.init(
      gulp,
      { silent: true, sourceMaps: false },
      undefined,
      require(path.resolve(PROJECT_ROOT, 'paths.js'))
    );
    gulp.start('js', function() {
      assert(!fs.existsSync(path.resolve(PROJECT_BUILD_DIR, 'app.js.map')));
      done();
    });
  });

  it('cleans up', function(done) {
    initDefaultProject();
    gulp.start('assets', 'js', 'less', 'html', function() {
      assert(fs.readdirSync(path.resolve(PROJECT_ROOT, 'build')).length !== 0);
      gulp.start('clean', function() {
        assert(!fs.existsSync(path.resolve(PROJECT_ROOT, 'build')));
        done();
      });
    });
  });

  it('lints javascript', function(done) {
    initDefaultProject();
    // Capture the output
    var captured = [];
    var orig = console.log;
    console.log = function() {
      captured.push(Array.prototype.slice.apply(arguments));
    };
    gulp.start('jslint', function() {
      // Revert the capture
      console.log = orig;
      assert(captured.join('').indexOf('2 warnings') !== -1);
      done();
    })
  });


  it('runs all tasks via the build task', function() {
    // This type of testing relies upon gulps implementation and is, admittedly a bit unstable.
    // It's the easiest way to inspect these dependencies chains without writing a huge slop of
    // test code to verify *every* step (which we already did independently above)
    assert(typeof gulp.tasks['build'] === 'object');
    assert.deepEqual(
      gulp.tasks['build'].dep,
      ['assets', 'jslint', 'js', 'less', 'html', 'set-config']
    );
  });


  it('has a default task which runs the build task', function() {
    assert(typeof gulp.tasks['default'] === 'object');
    assert.deepEqual(
      gulp.tasks['default'].dep,
      ['build']
    );
  });

});
