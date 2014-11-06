'use strict';

/**
 * Merges the provided objects into the target.  Overlapping values are overwritten
 * by objects later in the parameter collection.
 *
 * @param   {object}    target The object to merge into.
 * @param   {...object} on     1-n objects to merge into target.
 *
 * @return  {mixed}   An object resulting from the merge, or undefined if no
 *                    target was provided.
 */
function merge() {
  var objects = Array.prototype.slice.call(arguments);
  var target = objects.shift();
  if(typeof target !== 'object' || Array.isArray(target)) {
    return;
  }
  objects.forEach(function(o) {
    if(typeof o === 'object') {
      Object.getOwnPropertyNames(o).forEach(function(n) {
        var v;
        if(Array.isArray(o[n])) {
          v = o[n].slice();
        } else if(typeof o[n] === 'object') {
          v = merge({}, o[n]);
        } else {
          v = o[n];
        }
        target[n] = v;
      });
    }
  });
  return target;
}

module.exports = merge;