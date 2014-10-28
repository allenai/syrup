var less = require('less');
var path = require('path');
var assert = require('assert');
var fs = require('fs');

describe('syrup/less/syrup.less', function() {
  it('compiles', function(done) {
    less.render(
      fs.readFileSync(path.resolve(__dirname, '..', 'less', 'syrup.less')).toString(),
      {
        paths: [ path.resolve(__dirname, '..', 'less') ]
      },
      function(e, css) {
        if(e) {
          assert.fail('No Error', 'Error', 'LESS Compilation Error: ' + e.message + ' in file ' + e.filename +
            ' on line ' + e.line);
        }
        done();
      }
    );
  });
});