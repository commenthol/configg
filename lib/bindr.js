'use strict';

var _ = require('lodash');

/**
 * Normalize and split `keys` for `get` and `set` method.
 * Splits by "."
 *
 * @param {String|Array} keys
 * @api private
 */
function splitKeys (keys) {
	if (typeof(keys) === 'string') {
		return keys.replace(/^\s*\.\s*/,'')
			.replace(/(?:\s*\.\s*)+/g, '.')
			.split('.');
	}
	else if (Array.isArray(keys)) {
		return [].concat(keys);
	}
}

/**
 * Add a get method to any object
 * @example
 *
 *     var obj = { a: { b: 1 } };
 *     obj.get = get.bind(obj);
 *     console.log(obj.get('a.b'))
 *     //> 1
 *
 * @param {String|Array} keys - the keys where to find the content
 * @return {Object|Any} the content found under keys or undefined
 */
function get (keys){
	var i,
		tmp = this; // jshint ignore:line

	keys = splitKeys(keys);

	if (keys === undefined) {
		return this; // jshint ignore:line
	}

	for (i = 0; i < keys.length; i+=1 ) {
		if (typeof tmp === 'object' && tmp.hasOwnProperty(keys[i])) {
			tmp = tmp[keys[i]];
		}
		else {
			tmp = undefined;
			break;
		}
	}
	return tmp;
}

function merge(obj) {
	return _.merge(this, obj); // jshint ignore:line
}

/**
 * Add the bindings to the object
 * @param {Object} obj - Object to add the get methods
 * @throws {Error} if `.get` is already defined
 */
function bindr(obj) {
	if (!obj) {
		return;
	}
	if (obj.get) {
		throw new Error('get method already defined');
	}
	obj.get = get.bind(obj);
	Object.defineProperty(obj, 'get', {
		enumerable: false
	});

	if (obj.merge) {
		throw new Error('merge method already defined');
	}
	obj.merge = merge.bind(obj);
	Object.defineProperty(obj, 'merge', {
		enumerable: false
	});
}

module.exports = bindr;

