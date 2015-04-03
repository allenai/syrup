(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/skone/Projects/syrup/fixtures/project/src/bar.js":[function(require,module,exports){
"use strict";

module.exports = {
  bar: true
};

},{}],"/Users/skone/Projects/syrup/fixtures/project/src/foo.js":[function(require,module,exports){
'use strict';

var b = require('./bar');

if (b) var a = 'foobar';

module.exports = {
  foo: b.bar };

},{"./bar":"/Users/skone/Projects/syrup/fixtures/project/src/bar.js"}]},{},["/Users/skone/Projects/syrup/fixtures/project/src/foo.js"])


//# sourceMappingURL=foo.js.map