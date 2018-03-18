/**
 * @module lib/files
 * @copyright 2015 commenthol
 * @license MIT
 */

'use strict'

// module dependencies;
var fs = require('fs')
var path = require('path')
var toNumber = require('./tonumber')

/**
 * @constructor
 * @param {Path} fullname - filename
 * @throws {Error} error, e.g. parser, file-not-found, unsupported file
 * @return {Object} - parsed object or undefined
 */
function File (fullname) {
  if (!(this instanceof File)) {
    return new File(fullname)
  }

  /** @member */
  this.obj = null

  /**
   * internal mapping of extensions to parsing functions
   * order is important!
   */
  this._map = {
    '.js': this.parseJs,
    '.json': this.parseJson,
    '.json5': this.parseJson5,
    '.hjson': this.parseHjson,
    '.toml': this.parseToml,
    '.coffee': this.parseCoffee,
    '.yaml': this.parseYaml,
    '.yml': this.parseYaml,
    '.cson': this.parseCson,
    '.properties': this.parseProperties
  }

  this._encoding = 'utf-8'
  this._fullname = fullname || ''
  this._ext = this.extname()

  if (this._ext) {
    try {
      this.obj = this._map[this._ext].call(this)
      if (this.obj instanceof Error) {
        this.error = this.obj // catch hidden parser errors
      }
    } catch (e) {
      this.error = e
    }
  } else {
    if (this._fullname !== '') {
      this.error = new Error('unsupported file')
      this.error.code = 'ENOSUPP'
    }
  }
  if (this.error) {
    throw new Error(this._fullname + ' - ' + this.error.message)
  }

  return this
}

/**
 * returns the order of processing the file extensions
 * @public
 * @return {Array} - of {Strings}
 */
File.prototype.extNames = function () {
  return Object.keys(this._map)
}

/**
 * reads and parses a json file
 * @protected
 * @throws {Error} parser error
 * @return {Object} - parsed object
 */
File.prototype.parseCoffee = function () {
  // istanbul ignore else
  if (!this._coffee) {
    this._coffee = require('coffeescript')
    // istanbul ignore else
    // coffee-script >= 1.7.0 requires explicit registration for require() to work
    if (this._coffee.register) {
      this._coffee.register()
    }
  }
  return require(this._fullname)
}

/**
 * reads a js file with require
 * @protected
 * @throws {Error} parser error
 * @return {Object} - parsed object
 */
File.prototype.parseJs = function () {
  return require(this._fullname)
}

/**
 * reads and parses a json file
 * @protected
 * @throws {Error} parser error
 * @return {Object} - parsed object
 */
File.prototype.parseJson = function () {
  return JSON.parse(this.readSync())
}

/**
 * reads and parses a json file
 * @protected
 * @throws {Error} parser error
 * @return {Object} - parsed object
 */
File.prototype.parseJson5 = function () {
  return require('json5').parse(this.readSync())
}

/**
 * reads and parses a hjson file
 * @protected
 * @throws {Error} parser error
 * @return {Object} - parsed object
 */
File.prototype.parseHjson = function () {
  return require('hjson').parse(this.readSync())
}

/**
 * reads and parses a cson file
 * @protected
 * @throws {Error} parser error
 * @return {Object} - parsed object
 */
File.prototype.parseCson = function () {
  return require('cson').parse(this.readSync())
}

/**
 * reads and parses a properties file
 * @protected
 * @throws {Error} parser error
 * @return {Object} - parsed object
 */
File.prototype.parseProperties = function () {
  function reviver (key, value, section) {
    // Do not split section lines
    if (this.isSection) { // jshint ignore:line
      return this.assert() // jshint ignore:line
    }
    // Split all the string values by a comma
    if (typeof value === 'string') {
      var values = value.split(',')
      values = values.map(function (v) {
        return toNumber(v)
      })
      return values.length === 1 ? value : values
    }
    // Do not split the rest of the lines
    return this.assert() // jshint ignore:line
  }

  return require('properties').parse(
    this.readSync(), {
      namespaces: true,
      variables: true,
      sections: true,
      reviver: reviver
    }
  )
}

/**
 * reads and parses a TOML file
 * @protected
 * @throws {Error} parser error
 * @return {Object} - parsed object
 */
File.prototype.parseToml = function () {
  return require('toml').parse(this.readSync())
}

/**
 * reads and parses a yaml file
 * @protected
 * @throws {Error} parser error
 * @return {Object} - parsed object
 */
File.prototype.parseYaml = function () {
  return require('js-yaml').load(this.readSync())
}

/**
 * load file synchronously
 * @protected
 * @throws {Error} read file error
 */
File.prototype.readSync = function () {
  return fs.readFileSync(this._fullname, this._encoding)
}

/**
 * detect extension and check if parser function is available
 * @protected
 * @return {String}
 */
File.prototype.extname = function () {
  var ext = path.extname(this._fullname)

  if (ext in this._map) {
    return ext
  }
}

module.exports = File
