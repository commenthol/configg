/**
 * @module lib/utils
 * @copyright 2015 commenthol
 * @license MIT
 */

'use strict'

// module dependencies
var fs = require('fs')
var log = require('debug')('configg%s')
var path = require('path')
var hjson = require('hjson')

var utils = {}

/**
 * Log Error to console
 * @param {String} message - error message
 */
utils.error = function (message) {
  console.error('ERROR: ' + message)
}

/**
 * get all basenames for config resolution in the right order
 * @param {Object} env - object with env Vars
 * @return {Array} of Strings containing basenames
 */
utils.baseNames = function (env) {
  var baseNames = [
    'default',
    'default NODE_APP_INSTANCE',
    'NODE_ENV',
    'NODE_ENV NODE_APP_INSTANCE',
    'HOSTNAME',
    'HOSTNAME NODE_APP_INSTANCE',
    'HOSTNAME NODE_ENV',
    'HOSTNAME NODE_ENV NODE_APP_INSTANCE',
    'local',
    'local NODE_APP_INSTANCE',
    'local NODE_ENV',
    'local NODE_ENV NODE_APP_INSTANCE'
  ]

  baseNames = baseNames
    .map(function (str) {
      var arr = str.split(' ')
      var out = []

      for (var i = 0; i < arr.length; i++) {
        if (/^default|local$/.test(arr[i])) {
          out.push(arr[i])
        } else if (env[arr[i]]) {
          out.push(env[arr[i]])
        } else {
          return
        }
      }
      return out.join('-')
    })
    .filter(function (p) {
      // filter out undefined values
      if (p) {
        return true
      }
    })

  return baseNames
}

/**
 * parse the HJSON config object from commandline
 * @param {Object} env - object with env Vars
 * @throw {Error} - parser error
 * @return {Object} - parsed NODE_CONFIG env variable
 */
utils.parseNodeConfig = function (env) {
  if (env && env.NODE_CONFIG) {
    return hjson.parse(env.NODE_CONFIG)
  }
}

/**
 * normalize dir path - all config data needs to reside in a dir named "config"
 * @param {Path} dir - a path containing or not containing a tailing "/config"
 * @return {Path} - normalized `dir` containing a tailing "/config"
 */
utils.normDir = function (dir) {
  return path.normalize(dir + '/')
}

/**
 * normalize config dir path - all config data needs to reside in a dir named "config"
 * @param {Path} dir - a path containing or not containing a tailing "/config"
 * @return {Path} - normalized `dir` containing a tailing "/config"
 */
utils.normConfigDir = function (dir) {
  dir = dir.replace(/^(.*?)(?:\/(?:config\/?)?)?$/, '$1/config/')
  return path.normalize(dir)
}

/**
 * discover the module name from a package.json
 * @param {Path} dir - config dir (needs to be in the same folder as the `package.json`)
 * @return {Object} - name of module
 */
utils.discoverModuleNameVersion = function (dir) {
  dir = path.normalize(dir + '../')

  var name
  var version
  var packageJson = dir + 'package.json'

  if (fs.existsSync(packageJson)) {
    try {
      name = require(packageJson).name
      version = require(packageJson).version
    } catch (e) {}
  }
  if (!name) {
    throw new Error('No package.json found in ' + dir)
  }
  return {
    name: name,
    version: version
  }
}

/**
 * read the contents of `dir`
 * @param {Path} dir
 * @param {Boolean} strict - throws error if true
 * @throw {Error} - dir not found error - only if strict = true
 * @return {Array} of filenames
 */
utils.readDir = function (dir, strict) {
  var msg
  try {
    return fs.readdirSync(dir)
  } catch (e) {
    msg = 'Can\'t read config from dir ' + dir
    if (strict) {
      utils.error(msg)
      throw new Error('strict mode failed!')
    }
    log('%s', ':warning', msg)
  }
}

/**
 * Add environent variables
 * @param {Object} obj -
 * @param {Object} env -
 */
utils.env = function (env, keys) {
  var obj = {}
  keys = keys || ['NODE_ENV', 'NODE_APP_INSTANCE', 'HOSTNAME']
  keys.forEach(function (p) {
    obj[p] = env[p]
  })
  return obj
}

/**
 * Run strict mode checks
 * @param {Object} env - object with env Vars
 * @param {Object} foundFiles - object with found files
 * @return {Boolean} true if required files are present
 */
utils.strictModeCheck = function (env, foundFiles) {
  var check = true
  var last
  var regEnv = new RegExp('(?:^|-)' + env.NODE_ENV)
  var regIns = new RegExp('-' + env.NODE_APP_INSTANCE)
  var regHost = new RegExp('(?:^|-)' + env.HOSTNAME)

  function and (last) {
    check = check && last
  }

  if (!env.NODE_CONFIG_STRICT_MODE) {
    return true
  }

  // avoid ambiguities between local and default
  last = !/^(local|default)$/.test(env.NODE_ENV)
  if (!last) {
    utils.error('strict mode: NODE_ENV is set to ' +
      env.NODE_ENV, true)
  }
  and(last)

  // no further checks in development
  if (env.NODE_ENV === 'development') {
    return check
  }

  // check NODE_ENV
  last = foundFiles.some(function (filename) {
    return regEnv.test(filename)
  })
  and(last)
  if (!last) {
    utils.error('strict mode: No config file for NODE_ENV=' +
      env.NODE_ENV + ' in ' + env.NODE_CONFIG_DIR + ' found', true)
  }

  // check HOSTNAME
  if (/\bhostname\b/i.test(env.NODE_CONFIG_STRICT_MODE)) {
    last = foundFiles.some(function (filename) {
      return regHost.test(filename)
    })
    and(last)
    if (!last) {
      utils.error('strict mode: No config file for HOSTNAME=' +
        env.HOSTNAME + ' in ' + env.NODE_CONFIG_DIR +
        ' found', true)
    }
  }

  // check APP INSTANCE
  if (env.NODE_APP_INSTANCE) {
    last = foundFiles.some(function (filename) {
      return regIns.test(filename)
    })
    and(last)
    if (!last) {
      utils.error('strict mode: No config file for APP_INSTANCE=' +
        env.NODE_APP_INSTANCE + ' in ' + env.NODE_CONFIG_DIR +
        ' found', true)
    }
  }

  return check
}

module.exports = utils
