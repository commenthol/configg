/**
 * @copyright commenthol
 * @license MIT
 */

'use strict';

/* global describe, it */

var assert = require('assert');
var File = require('../lib/files');

var confDir = __dirname + '/fixtures/myapp/config/';

function assertObj (file) {
	var obj = file.obj;
	assert.strictEqual(obj.config.database.host, 'dbhost');
	assert.strictEqual(obj.config.database.name, 'dbtest');
	assert.strictEqual(obj.config.database.port, 1529);
	assert.deepEqual(obj.config.array, [1,"2",3.01] );
	assert.strictEqual(obj.common.value, "test");
	assert.equal(file.error, undefined);
}

describe('#File', function(){

	describe('tests', function(){
		it('construct without new', function(){
			var file = File(); // jshint ignore:line
			assert.ok(file instanceof File);
		});
		it('get right order of extensions', function(){
			var file = new File();
			assert.deepEqual(file.extNames(), [".js",".json",".json5",".hjson",".toml",".coffee",".yaml",".yml",/*".cson",*/".properties"]);
		});
	});

	describe('failures', function(){
		it('try loading a not existing file', function(){
			assert.throws(function(){
				new File(confDir + 'notexists.json');
			});
		});
		it('try loading a file with unsupported extension', function(){
			assert.throws(function(){
				new File(confDir + 'default.txt');
			});
		});
		it('try loading a bad cson file', function(){
			assert.throws(function(){
				new File(confDir + 'bad.cson');
			});
		});
		it('try loading a bad json file', function(){
			assert.throws(function(){
				new File(confDir + 'bad.json');
			});
		});
	});

	describe('load', function(){
		it('coffee file', function(){
			var file = new File(confDir + 'default.coffee');
			assertObj(file);
		});
		//~ it('cson file', function(){ // note: testcase fails on node v0.11.x
			//~ var file = new File(confDir + 'default.cson');
			//~ assertObj(file);
		//~ });
		it('js file', function(){
			var file = new File(confDir + 'default.js');
			assertObj(file);
		});
		it('json file', function(){
			var file = new File(confDir + 'default.json');
			assertObj(file);
		});
		it('json5 file', function(){
			var file = new File(confDir + 'default.json5');
			assertObj(file);
		});
		it('hjson file', function(){
			var file = new File(confDir + 'default.hjson');
			assertObj(file);
		});
		it('properties file', function(){
			var file = new File(confDir + 'default.properties');
			assertObj(file);
		});
		it('toml file', function(){
			var file = new File(confDir + 'default.toml');
			assertObj(file);
		});
		it('yaml file', function(){
			var file = new File(confDir + 'default.yaml');
			assertObj(file);
		});
		it('yml file', function(){
			var file = new File(confDir + 'default.yml');
			assertObj(file);
		});
	});

});
