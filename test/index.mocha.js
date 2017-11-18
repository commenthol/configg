/**
 * @copyright commenthol
 * @license MIT
 */

var assert = require('assert')
var configg = require('..')

describe('#configg', function () {
  it('should load global config', function () {
    var config = configg()
    assert.deepEqual(config.config, { default: true, development: true })
  })
})
