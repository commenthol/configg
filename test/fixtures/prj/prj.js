'use strict';

var config = require('configg')(__dirname);

var moduleA = require('module-a');
var moduleB = require('module-b');

var M = function(){
	return {
		prj: config,
		a: moduleA(),
		b: moduleB(),
	};
}

module.exports = M;

if (module === require.main) {
	console.log(JSON.stringify(M(), null, 2));
}
