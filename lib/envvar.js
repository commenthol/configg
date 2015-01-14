/**
 * @copyright commenthol
 * @license MIT
 */

'use strict';

/// module dependencies
var os = require('os');
var path = require('path');

/**
 * setup the required environment variables
 * @param {Object} env - an object where to add the env vars
 * @return {Object} - an object where to add the env vars
 */
function setup(env) {
	env = env || {};

	function _resolve(name, value) {
		env[name] = resolve(name, value);
	}

	_resolve('NODE_ENV', 'development');
	_resolve('NODE_CONFIG_DIR', '');
	//TODO _resolve('NODE_CONFIG_DIR', process.cwd() + '/config');
	_resolve('NODE_APP_INSTANCE');
	_resolve('NODE_CONFIG');

	env.HOSTNAME = resolveHostname();

	if (env.NODE_CONFIG_DIR.indexOf('.') === 0) {
		env.NODE_CONFIG_DIR = path.normalize(process.cwd() + '/' + env.NODE_CONFIG_DIR);
	}

	return env;
}

/**
 * resolve the environment variable
 * @param {String} name - name of environment variable
 * @param {String} value - default value of environment variable
 * @return {String} value of environment variable
 */
function resolve (name, value) {
	return cmdLine(name) || process.env[name] || value;
}

/**
 * resolve hostname
 */
function resolveHostname () {
	return resolve('HOST') || resolve('HOSTNAME') || os.hostname();
}

/**
 * get environment variable from commandline arguments
 * @param {String} name - name of environment variable
 * @return {String} value of environment variable
 */
function cmdLine (name) {
	var argv = process.argv.slice(2, process.argv.length);
	var argName = '--' + name + '=';

	for (var i=0; i<argv.length; i++) {
		if (argv[i].indexOf(argName) === 0) {
			return argv[i].substr(argName.length);
		}
	}
}

module.exports = {
	setup: setup,
	resolve: resolve,
	resolveHostname: resolveHostname,
};
