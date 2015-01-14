/**
 * @copyright commenthol
 * @license MIT
 */

'use strict';

/// module dependencies
var fs = require('fs');
var path = require('path');
var hjson = require('hjson');

var utils = {};

/**
 * get all basenames for config resolution in the right order
 * @param {Object} env - object with env Vars
 * @return {Array} of Strings containing basenames
 */
utils.baseNames = function(env) {
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
	];

	baseNames = baseNames
	.map(function(str){
		var arr = str.split(' ');
		var out = [];

		for (var i=0; i<arr.length; i++) {
			if (/^default|local$/.test(arr[i])) {
				out.push(arr[i]);
			}
			else if (env[arr[i]]) {
				out.push(env[arr[i]]);
			}
			else {
				return;
			}
		}
		return out.join('-');
	})
	.filter(function(p){
		// filter out undefined values
		if (p) {
			return true;
		}
	});

	return baseNames;
};

/**
 * parse the HJSON config object from commandline
 * @param {Object} env - object with env Vars
 * @throw {Error} - parser error
 * @return {Object} - parsed NODE_CONFIG env variable
 */
utils.parseNodeConfig = function(env) {
	if (env && env.NODE_CONFIG) {
		return hjson.parse(env.NODE_CONFIG);
	}
};

/**
 * normalize dir path - all config data needs to reside in a dir named "config"
 * @param {Path} dir - a path containing or not containing a tailing "/config"
 * @return {Path} - normalized `dir` containing a tailing "/config"
 */
utils.normDir = function(dir) {
	return path.normalize(dir + '/');
};

/**
 * normalize config dir path - all config data needs to reside in a dir named "config"
 * @param {Path} dir - a path containing or not containing a tailing "/config"
 * @return {Path} - normalized `dir` containing a tailing "/config"
 */
utils.normConfigDir = function(dir) {
	dir = dir.replace(/^(.*?)(?:\/(?:config\/?)?)?$/, "$1/config/");
	return path.normalize(dir);
};

/**
 * discover the module name from a package.json
 * @param {Path} dir - config dir (needs to be in the same folder as the `package.json`)
 * @return {Object} - name of module
 */
utils.discoverModuleNameVersion = function(dir) {
	dir = path.normalize(dir + '../');

	var name;
	var version;
	var packageJson = dir + 'package.json';

	if (fs.existsSync(packageJson)) {
		try {
			name = require(packageJson).name;
			version = require(packageJson).version;
		} catch(e) {}
	}
	if (!name) {
		throw new Error('No package.json found in ' + dir);
	}
	return {
		name: name,
		version: version
	};
};

/**
 * read the contents of `dir`
 * @param {Path} dir
 * @throw {Error} - dir not found error
 * @return {Array} of filenames
 */
utils.readDir = function(dir) {
	try {
		return fs.readdirSync(dir);
	} catch (e) {
		throw new Error('Can\'t read dir ' + dir);
	}
};

module.exports = utils;
