/*eslint-env node, mocha */

import * as util from './util.js';
import assert from 'assert';

describe('sayHi', () => {
  it('should say hi', () => {
    const salutation = util.sayHi('friend');
    assert.equal(salutation, 'hi friend!!');
  });
});
