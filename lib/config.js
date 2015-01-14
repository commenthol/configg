/**
 * @copyright commenthol
 * @license MIT
 */

'use strict';

/// module dependencies
var _ = require('lodash');
var File = require('./files');
var envVar = require('./envvar');
var utils = require('./utils');
var bindr = require('./bindr');

/**
 * config class handling loading and merging of config files
 * @constructor
 */
function Config() {
	var obj;

	this._entries = [];     // storage for module configs
	this._entriesRefs = {}; // references per dirname to storage items
	this._entriesApp = [];  // storage for App config

	this.env = envVar.setup();                      // environment vars
	this.baseNames = utils.baseNames(this.env);      // allowed basenames in right order
	this.extNames = File().extNames();              // parseable extension

	// add config from NODE_CONFIG
	this.addAppEntry('NODE_CONFIG','', '0.0.0', utils.parseNodeConfig(this.env));

	if (this.env.NODE_CONFIG_DIR) {
		obj = this.loadFiles(utils.normDir(this.env.NODE_CONFIG_DIR));
	}
	// add config from NODE_CONFIG_DIR
	this.addAppEntry('NODE_CONFIG_DIR','', '0.0.0', obj);
}

/**
 * read configuration from `dir` and merge
 * @public
 * @param {Path} dirname - directory to read config from
 * @param {Boolean} isApp - If true then dirname contains the Application config. Default=false
 * @throws {Error}
 * @return {Object} configuration object
 */
Config.prototype.dir = function(dirname, isApp) {
	isApp = isApp || false;
	dirname = utils.normConfigDir(dirname);

	var out;
	var nameVersion = utils.discoverModuleNameVersion(dirname);
	var obj = this.loadFiles(dirname, nameVersion.name);

	this.addEntry(dirname, nameVersion.name, nameVersion.version, obj, isApp);
	out = this.mergeModuleConfig(dirname, nameVersion.name, nameVersion.version);

	// add the get methods
	bindr(out);
	bindr(out.config);
	bindr(out.common);

	return out;
};

/**
 * merge application configuration with AppConfig, NODE_CONFIG, NODE_CONFIG
 * @private
 * @return {Object} - merged object
 */
Config.prototype.mergeAppConfig = function() {
	var obj = _.merge({},
				this._entriesApp[2] &&
				this._entriesApp[2].obj, // application config
				this._entriesApp[1].obj, // NODE_CONFIG_DIR from env/args
				this._entriesApp[0].obj  // NODE_CONFIG from env/args
			);
	return obj;
};

/**
 * merge module configuration from `dir` with `mergePrj`
 * @param {Path} dirname
 * @param {String} name - module name from package.json
 * @param {String} version - module version from package.json
 * @return {Object} - merged object
 */
Config.prototype.mergeModuleConfig = function(dirname, name, version) {
	var out = {};
	var entry = this._entriesRefs[dirname];
	var obj = _.merge({},
					this._entries[entry] &&
					this._entries[entry].obj,
					this.mergeAppConfig()
				);

	// overwrite with version specials
	out.config = _.merge(obj[name], obj[name + '@' + version]);
	out.common = obj.common;

	return out;
};

/**
 * load files from configuration directory `dirname`
 * @param {Path} dirname - directory to read config files
 * @throws {Error} - error, e.g. parser, file-not-found, unsupported file
 * @return {Object} - merged object from all files within `dirname`
 */
Config.prototype.loadFiles = function(dirname, name) {
	var
		obj,
		file,
		baseName,
		extName,
		filename,
		c = {},
		files = {};

	(utils.readDir(dirname) /*|| []*/).forEach(function(f){
		files[f] = 1; // put found files into hashmap
	});
	// loop through the configured files in the right order
	for (c.base = 0; c.base < this.baseNames.length; c.base++) {
		baseName = this.baseNames[c.base];
		for (c.ext = 0; c.ext < this.extNames.length; c.ext++) {
			extName = this.extNames[c.ext];
			filename = baseName + extName;
			if (filename in files) {
				// found first allowed file
				file = new File(dirname + filename); // load and parse
				obj = _.merge(obj || {}, file.obj);
				break;
			}
		}
	}

	// move obj.config to obj[name]
	if (name && obj && obj.config) {
		obj[name] = _.merge({}, obj.config, obj[name]);
	}

	return obj;
};

/**
 * store config object for a module
 * @param {Path} dirname - dirname of config files loaded
 * @param {String} name - module name
 * @param {String} version - module version
 * @param {Object} obj - configuration object
 * @throws {Error} if isApp true and AppConfig is already set
 */
Config.prototype.addEntry = function(dirname, name, version, obj, isApp) {
	if (isApp) {
		this.addAppEntry(dirname, name, version, obj, isApp);
	}
	else {
		this._entries.push({
			name: name,
			version: version,
			dirname: dirname,
			obj: obj
		});
		this._entriesRefs[dirname] = this._entries.length-1;
	}
};

/**
 * store config object for the Application
 * @param {Path} dirname - dirname of config files loaded
 * @param {String} name - module name
 * @param {String} version - module version
 * @param {Object} obj - configuration object
 * @throws {Error} if AppConfig is already set
 */
Config.prototype.addAppEntry = function(dirname, name, version, obj, isApp) {
	var dn
	if (this._entriesApp.length > 2) {
		dn = this._entriesApp[2].dirname;
		throw new Error('App Config is already set by ' + dn + ' - overwrite by ' + dirname + ' is not allowed');
	}
	if (this._entries.length > 0) {
		dn = this._entries[0].dirname;
		throw new Error('Setting Module Config before App Config by ' + dn + ' is not allowed');
	}
	this._entriesApp.push({
		name: name,
		version: version,
		dirname: dirname,
		obj: obj
	});
};

module.exports = Config;
