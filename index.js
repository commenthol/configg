/**
 * @module configg
 * @copyright 2015 commenthol
 * @license MIT
 */

'use strict';

/// module dependencies
var Config = require('./lib/config');

/// the global config object
var globalConfig = new Config();

/**
 * read configuration from `dir` and merge
 * @export
 * @param {Path} dirname - directory to read config from
 * @throws {Error}
 * @return {Object} configuration object
 */
var M = function(dir) {
	return globalConfig.dir(dir);
};

/// append the Config class
M.Config = Config;

module.exports = M;

