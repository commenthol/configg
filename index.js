/**
 * @module configg
 * @copyright 2015-2019 commenthol
 * @license MIT
 */

'use strict'

// module dependencies
const Config = require('./src/config')

// the global config object
const globalConfig = new Config()

/**
 * read configuration from `dir` and merge
 * @export
 * @param {Path} dirname - directory to read config from
 * @throws {Error}
 * @return {Object} configuration object
 */
const M = function (dir) {
  const conf = globalConfig.dir(dir)
  return conf
}

// append the Config class
M.Config = Config

module.exports = M
