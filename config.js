'use strict';

var gutil = require('gulp-util');
var merge = require('./merge');

/**
 * Traverse the provided object and return the number of characters in the longest property name.
 *
 * @params {object} obj The object to be examined.
 *
 * @returns {number} The length of the longest property name.
 */
function longestPropNameLen(obj) {
  var max = 0;
  var len, prop;
  for(prop in obj) {
    if(obj.hasOwnProperty(prop) && typeof obj[prop] !== 'function') {
      len = prop.length;
      if(len > max) {
        max = len;
      }
      if(typeof obj[prop] === 'object') {
        len = longestPropNameLen(obj[prop]);
        if(len > max) {
          max = len;
        }
      }
    }
  }
  return max;
}

/**
 * Returns a string represeting the provided config object.
 *
 * @param {object} obj          The configuration object to print.
 * @param {string} [indent='']  Optional indentation to prefix before each configuration parameter.
 *
 * @returns {string} The nicely formatted config object as a string.
 */
function configString(obj, indent) {
  var out = '';
  indent = indent || '';
  var max = longestPropNameLen(obj);
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop) && typeof obj[prop] !== 'function') {
      if(typeof obj[prop] === 'object') {
        out += indent + gutil.colors.yellow(prop + ':') + '\n';
        out += configString(obj[prop], indent + '  ');
      } else {
        var chars = prop.length + indent.length;
        var spaces = (max + 4) - chars;
        var spacer = '';
        if(spaces <= 0) {
          spaces = 1;
        }
        while(spaces > 0) {
          spacer += ' ';
          spaces--;
        }
        out += indent + gutil.colors.yellow(prop + ':') + spacer +
            gutil.colors.magenta(obj[prop]) + '\n';
      }
    }
  }
  return out;
};



function Config(props) {
  merge(this, props);
}

Config.prototype.toString = function() {
  return [,
      '\n',
      gutil.colors.blue('*********** Configuration ***********'),
      configString(this),
      gutil.colors.blue('*************************************'),
      '\n'
    ].join('\n');
};

module.exports = Config;
