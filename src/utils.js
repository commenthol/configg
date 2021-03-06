/**
 * @module src/utils
 * @copyright 2015- commenthol
 * @license MIT
 */

'use strict'

// module dependencies
const fs = require('fs')
const log = require('debug')('configg')
const path = require('path')
const hjson = require('hjson')
const atLine = require('at-line')
const findRoot = require('find-root')

const utils = {}

/**
 * Log Error to console
 * @param {String} message - error message
 */
utils.error = function (message) {
  if (log.enabled) {
    log('ERROR %s', message)
  } else {
    console.error('  ERROR configg %s', message)
  }
}

/**
 * get all basenames for config resolution in the right order
 * @param {Object} env - object with env Vars
 * @return {Array} of Strings containing basenames
 */
utils.baseNames = function (env) {
  let baseNames = [
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
      const arr = str.split(' ')
      const out = []

      for (let i = 0; i < arr.length; i++) {
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
  if (dir === undefined) {
    throw new Error('No directory')
  }
  dir = dir.replace(/^(.*?)(?:\/(?:config\/?)|)?$/, '$1/config/')
  return path.normalize(dir)
}

/**
 * discover the module name from a package.json
 * @param {Path} dir - config dir (needs to be in the same folder as the `package.json`)
 * @return {Object} - name of module
 */
utils.discoverModuleNameVersion = function (dir) {
  dir = path.normalize(dir + '../')
  const packageJson = dir + 'package.json'

  let name
  let version

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
    name,
    version
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
  try {
    return fs.readdirSync(dir)
  } catch (e) {
    const msg = 'Can\'t read config from dir ' + dir
    if (strict) {
      utils.error(msg)
      throw new Error('strict mode failed!')
    }
    log('WARN %s', msg)
  }
}

/**
 * Add environent variables
 * @param {Object} obj -
 * @param {Object} env -
 */
utils.env = function (env, keys) {
  const obj = {}
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
  const regEnv = new RegExp('(?:^|-)' + env.NODE_ENV)
  const regIns = new RegExp('-' + env.NODE_APP_INSTANCE)
  const regHost = new RegExp('(?:^|-)' + env.HOSTNAME)
  let check = true
  let last

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

/**
* find root with package.json from calling module
*/
utils.findDirname = function () {
  const ats = atLine.stack(new Error(), 2, 2)
  let dirname

  if (ats) {
    let file = ats[0].file
    const indexFile = path.resolve(__dirname, '..', 'index.js')
    if (file === indexFile) {
      file = ats[1].file
    }
    log('find root from %s', file)
    dirname = findRoot(file)
  }

  return dirname
}

/**
 * Print config informartion to console if
 * `NODE_DEBUG=config` is set
 *
 * @param {String} dir - dirname of module config
 * @param {Object} conf - the config object
 */
utils.debugConfig = function (dir, conf) {
  const str = JSON.stringify(conf, (key, value) => {
    if (typeof value === 'object' && value.type === 'Buffer' && value.data) {
      return 'Buffer(\'' + Buffer.from(value.data).toString('base64') + '\')'
    } else if (typeof value === 'function') {
      return value.toString()
    }
    return value
  }, 2)
  log('%s %s', dir, str)
  return str
}

module.exports = utils
