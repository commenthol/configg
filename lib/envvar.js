/**
 * @module lib/envvar
 * @copyright 2015 commenthol
 * @license MIT
 */

'use strict'

// module dependencies
var os = require('os')
var path = require('path')

/**
 * setup the required environment variables
 * @param {Object} env - an object where to add the env vars
 * @return {Object} - an object where to add the env vars
 */
function setup (env) {
  env = env || {}

  function _resolve (name, value) {
    env[name] = resolve(name, value)
  }

  _resolve('NODE_CONFIG')
  _resolve('NODE_CONFIG_DIR', process.cwd() + '/config')
  _resolve('NODE_ENV', 'development')
  _resolve('NODE_APP_INSTANCE')
  _resolve('SUPPRESS_NO_CONFIG_WARNING')
  _resolve('NODE_CONFIG_STRICT_MODE')

  env.HOSTNAME = resolveHostname()

  if (env.NODE_CONFIG_DIR.indexOf('.') === 0) {
    env.NODE_CONFIG_DIR = path.normalize(process.cwd() + '/' + env.NODE_CONFIG_DIR)
  }

  return env
}

/**
 * delete configg environment values
 */
function delvars () {
  var argv = process.argv;

  ['NODE_CONFIG', 'NODE_CONFIG_DIR'].forEach(function (name) {
    var argName = '--' + name + '='

    for (var i = 2; i < argv.length; i++) {
      if (argv[i].indexOf(argName) === 0) {
        argv[i] = 'DEL'
      }
    }
    if (process.env[name]) {
      delete process.env[name]
    }
  })
}

/**
 * resolve the environment variable
 * @param {String} name - name of environment variable
 * @param {String} value - default value of environment variable
 * @return {String} value of environment variable
 */
function resolve (name, value) {
  var res = cmdLine(name) || process.env[name] || value
  return res
}

/**
 * resolve hostname
 */
function resolveHostname () {
  return resolve('HOSTNAME') || os.hostname()
}

/**
 * get environment variable from commandline arguments
 * @param {String} name - name of environment variable
 * @return {String} value of environment variable
 */
function cmdLine (name) {
  var argv = process.argv.slice(2, process.argv.length)
  var argName = '--' + name + '='

  for (var i = 0; i < argv.length; i++) {
    if (argv[i].indexOf(argName) === 0) {
      return argv[i].substr(argName.length)
    }
  }
}

module.exports = {
  setup: setup,
  delvars: delvars,
  resolve: resolve,
  resolveHostname: resolveHostname
}
