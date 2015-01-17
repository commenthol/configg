/**
 * @copyright commenthol
 * @license MIT
 */

'use strict';

/// module dependencies
var Config = require('./lib/config');

/// the global config object
var globalConfig = new Config();

var M = function(dir, isApp) {
	return globalConfig.dir(dir, isApp);
};

/// append the Config class
M.Config = Config;

module.exports = M;

