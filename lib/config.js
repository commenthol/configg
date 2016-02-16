/**
 * @module lib/config
 * @copyright 2015 commenthol
 * @license MIT
 */

'use strict'

// module dependencies
var _ = require('lodash')
var File = require('./files')
var envVar = require('./envvar')
var utils = require('./utils')
var bindr = require('./bindr')

/**
 * config class handling loading and merging of config files
 * @constructor
 */
function Config () {
  var obj

  this._entriesApp = [] // storage for App config
  this._entries = [] // storage for Module configs
  this._entriesRefs = {} // references per dirname to storage items

  this.env = envVar.setup() // environment vars
  this.baseNames = utils.baseNames(this.env) // allowed basenames in right order
  this.extNames = File().extNames() // parseable extension

  // ~ envVar.delvars() // FIXME - can cause trouble when not used as peerDependency
  // ~ utils.setSuppressWarnings(this.env)

  // add config from NODE_CONFIG
  this.addAppEntry(utils.parseNodeConfig(this.env))

  if (this.env.NODE_CONFIG_DIR) {
    obj = this.loadFiles(
      utils.normDir(this.env.NODE_CONFIG_DIR),
      undefined,
      this.env.NODE_CONFIG_STRICT_MODE
    )
  }
  // add config from NODE_CONFIG_DIR
  this.addAppEntry(obj)
}

/**
 * read configuration from `dir` and merge
 * @public
 * @param {Path} dirname - directory to read config from
 * @throws {Error}
 * @return {Object} configuration object
 */
Config.prototype.dir = function (dirname) {
  dirname = utils.normConfigDir(dirname)

  var out
  var obj
  var nameVersion
    // check if not already loaded
  if (!this._entriesRefs[dirname]) {
    nameVersion = utils.discoverModuleNameVersion(dirname)
    obj = this.loadFiles(dirname, nameVersion.name)
    this.addEntry(dirname, nameVersion.name, nameVersion.version, obj)
  }
  out = this.mergeModuleConfig(dirname)

  // add methods
  bindr(out)
  bindr(out.config)
  bindr(out.common)

  return out
}

/**
 * merge application configuration with AppConfig, NODE_CONFIG, NODE_CONFIG
 * @private
 * @return {Object} - merged object
 */
Config.prototype.mergeAppConfig = function () {
  var obj = _.merge({},
    this._entriesApp[1], // NODE_CONFIG_DIR from env/args
    this._entriesApp[0] // NODE_CONFIG from env/args
  )
  return obj
}

/**
 * merge module configuration from `dir` with `mergePrj`
 * @param {Path} dirname
 * @param {String} name - module name from package.json
 * @param {String} version - module version from package.json
 * @return {Object} - merged object
 */
Config.prototype.mergeModuleConfig = function (dirname) {
  var obj
  var entry
  var out = {}

  entry = this._entriesRefs[dirname]
  if (entry) {
    if (!entry.isMerged) {
      obj = _.merge({}, entry.obj, this.mergeAppConfig())
        // overwrite with version specials
      obj.config = _.merge({}, obj[entry.name], obj[entry.name + '@' + entry.version])
      entry.obj = {
        config: obj.config,
        common: obj.common
      }
      entry.isMerged = true
    }
    // deepClone to isolate config
    out.config = _.merge({}, entry.obj.config)
    out.common = _.merge({}, entry.obj.common)
  }
  // add env variables to common - ensures that module configs get them as well
  out.common = _.merge(out.common || {}, utils.env(this.env))

  return out
}

/**
 * load files from configuration directory `dirname`
 * @param {Path} dirname - directory to read config files
 * @param {String} name - modulename
 * @param {Boolean} strictMode - load files in strict mode
 * @throws {Error} - error, e.g. parser, file-not-found, unsupported file
 * @return {Object} - merged object from all files within `dirname`
 */
Config.prototype.loadFiles = function (dirname, name, strictMode) {
  var obj
  var file
  var baseName
  var extName
  var filename
  var c = {}
  var files = {}
  var found = []

  ;(utils.readDir(dirname, strictMode) || []).forEach(function (f) {
    files[f] = 1 // put found files into hashmap
  })
    // loop through the configured files in the right order
  for (c.base = 0; c.base < this.baseNames.length; c.base++) {
    baseName = this.baseNames[c.base]
    for (c.ext = 0; c.ext < this.extNames.length; c.ext++) {
      extName = this.extNames[c.ext]
      filename = baseName + extName
      if (filename in files) {
        // found first allowed file
        found.push(filename)
        file = new File(dirname + filename) // load and parse
        obj = _.merge(obj || {}, file.obj)
        break
      }
    }
  }

  // move obj.config to obj[name]
  if (name && obj && obj.config) {
    obj[name] = _.merge({}, obj.config, obj[name])
  }

  if (strictMode && !utils.strictModeCheck(this.env, found)) {
    throw new Error('strict mode failed!')
  }

  return obj
}

/**
 * store config object for a module
 * @param {Path} dirname - dirname of config files loaded
 * @param {String} name - module name
 * @param {String} version - module version
 * @param {Object} obj - configuration object
 */
Config.prototype.addEntry = function (dirname, name, version, obj) {
  this._entries.push({
    name: name,
    version: version,
    dirname: dirname,
    obj: obj
  })
  this._entriesRefs[dirname] = this._entries[this._entries.length - 1]
}

/**
 * store config object for the Application
 * @param {Object} obj - configuration object
 */
Config.prototype.addAppEntry = function (obj) {
  this._entriesApp.push(obj)
}

module.exports = Config
