/**
 * @copyright commenthol
 * @license MIT
 */

'use strict'

var assert = require('assert')
var toNumber = require('../src/tonumber')

describe('#toNumber', function () {
  it('convert 0', function () {
    assert.strictEqual(toNumber('0'), 0)
  })

  it('convert 10', function () {
    assert.strictEqual(toNumber('10'), 10)
  })

  it('convert -99', function () {
    assert.strictEqual(toNumber('-99'), -99)
  })

  it('convert 0.0', function () {
    assert.strictEqual(toNumber('0.0'), 0)
  })

  it('convert 10.0001', function () {
    assert.strictEqual(toNumber('10.0001'), 10.0001)
  })

  it('convert -99.99999', function () {
    assert.strictEqual(toNumber('-99.99999'), -99.99999)
  })

  it('do not convert 0.000.000.1', function () {
    assert.strictEqual(toNumber('0.000.000.1'), '0.000.000.1')
  })

  it('do not convert 10ten', function () {
    assert.strictEqual(toNumber('10ten'), '10ten')
  })

  it('do not convert 08-15', function () {
    assert.strictEqual(toNumber('08-15'), '08-15')
  })
})
