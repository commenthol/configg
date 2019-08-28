/**
 * @copyright commenthol
 * @license MIT
 */

const assert = require('assert')
const configg = require('..')

describe('#configg', function () {
  it('should load global config', function () {
    const config = configg()
    assert.deepStrictEqual(config.config, { default: true, development: true })
  })
})
