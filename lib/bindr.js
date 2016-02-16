/**
 * @module lib/bindr
 * @copyright 2015 commenthol
 * @license MIT
 */

'use strict'

var ht = require('hashtree').hashTree

var M = {}

/**
 * Securely gets a value from the config according to `keys`.
 *
 * Example:
 *
 *     config = { config: { one: { a: 1 } } };
 *     bindr(config);
 *     config.get('config.one.a');
 *     // => 1
 *     config.get('config.one.b');
 *     // => undefined
 *
 * @param {String|Array} keys - dot separated string or Array to gather `value` from the config
 * @return {Any} value found using keys or undefined
 */
M.get = function (keys) {
  return ht.get(this, keys) // jshint ignore:line
}

/**
 * Add the bindings to the object
 * @param {Object} obj - Object to add the get methods
 * @throws {Error} if `.get` is already defined
 */
function bindr (obj, methods) {
  if (!obj || typeof obj !== 'object') {
    return
  }
  methods = methods || ['get']

  methods.forEach(function (p) {
    if (obj[p]) {
      throw new Error(p + ' method already defined')
    }
    obj[p] = M[p].bind(obj)
    Object.defineProperty(obj, p, {
      enumerable: false
    })
  })
}

module.exports = bindr
