/**
 * @copyright commenthol
 * @license MIT
 */

'use strict'

const assert = require('assert')
const bindr = require('../src/bindr')

describe('#bindr', function () {
  it('should return if obj is not defined', function () {
    const res = bindr()
    assert.ok(!res)
  })

  it('should not throw error if obj is not an object', function () {
    const res = bindr('string')
    assert.ok(!res)
  })

  it('should apply get method to obj', function () {
    const obj = { this: { is: { a: { test: 'yes' } } } }
    bindr(obj)
    assert.deepStrictEqual(obj.get('this'), { is: { a: { test: 'yes' } } })
    assert.deepStrictEqual(obj.get('this.is'), { a: { test: 'yes' } })
    assert.deepStrictEqual(obj.get('this.is.a'), { test: 'yes' })
    assert.deepStrictEqual(obj.get('this.is.a.test'), 'yes')
  })

  it('should return undefined if property cannot be found', function () {
    const obj = { this: { is: { a: { test: 'yes' } } } }
    bindr(obj)
    assert.deepStrictEqual(obj.get('that.is.a'), undefined)
    assert.deepStrictEqual(obj.get('this.isnt.a.test'), undefined)
  })
})
