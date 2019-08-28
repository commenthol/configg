/*
 * @module src/tonumber
 * @copyright 2015- commenthol
 * @license MIT
 */

'use strict'

const NUMBER = /^-?[0-9]+(?:\.[0-9]+)?$/

/**
 * converts a string value to a number (integer, float)
 * @param {String} value - value to convert
 * @return {Number|String} - if successful then return is a number, otherwise same as the input
 */
function toNumber (value) {
  if (NUMBER.test(value)) {
    const tmp = parseFloat(value, 10)
    // istanbul ignore else
    if (!isNaN(tmp)) {
      value = tmp
    }
  }
  return value
}

module.exports = toNumber
