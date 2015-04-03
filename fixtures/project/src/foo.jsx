var b = require('./bar');

if(b) var a = 'foobar';

module.exports = {
  foo: b.bar,
};
