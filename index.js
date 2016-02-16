/**
 * @module configg
 * @copyright 2015 commenthol
 * @license MIT
 */

'use strict'

// module dependencies
var Config = require('./lib/config')

// the global config object
var globalConfig = new Config()

/**
 * Print config informartion to console if
 * `NODE_DEBUG=config` is set
 *
 * @param {String} dir - dirname of module config
 * @param {Object} conf - the config object
 */
function debugConfig (dir, conf) {
  var obj
  if (/\bconfig\b/.test(process.env.NODE_DEBUG)) {
    obj = {
      message: 'DEBUG configg',
      dir: dir,
      config: conf
    }
    console.log(JSON.stringify(obj,
      function (key, value) {
        if (typeof value === 'function') {
          return value.toString()
        }
        return value
      }, 2))
  }
}

/**
 * read configuration from `dir` and merge
 * @export
 * @param {Path} dirname - directory to read config from
 * @throws {Error}
 * @return {Object} configuration object
 */
var M = function (dir) {
  var conf = globalConfig.dir(dir)
  debugConfig(dir, conf)
  return conf
}

// append the Config class
M.Config = Config

module.exports = M
