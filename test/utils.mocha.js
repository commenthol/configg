/**
 * @copyright commenthol
 * @license MIT
 */

'use strict';

/* global describe, it */

var assert = require('assert');
var utils = require('../lib/utils');

describe('#utils', function(){

	describe('#parseNodeConfig', function(){
		it('parse commandline config in HJSON', function(){
			var env = {
				NODE_CONFIG: '{ module: { database: { pass: "secret" } } }'
			};
			var exp = { module: { database: { pass: 'secret' } } };
			var res = utils.parseNodeConfig(env);
			assert.deepEqual(res, exp);
		});
		it('parse commandline config in JSON', function(){
			var env = {
				NODE_CONFIG: '{ "module": { "database": { "pass": "secret" } } }'
			};
			var exp = { module: { database: { pass: 'secret' } } };
			var res = utils.parseNodeConfig(env);
			assert.deepEqual(res, exp);
		});
		it('parse unset commandline config', function(){
			var env = {};
			var exp;
			var res = utils.parseNodeConfig(env);
			assert.deepEqual(res, exp);
		});
		it('parse bad commandline config', function(){
			var env = {
				NODE_CONFIG: '{ "module: { database": { "pass": "secret" } } }'
			};
			var res;
			assert.throws(function(){
				res = utils.parseNodeConfig(env);
			});
		});
	});

	describe('#normConfigDir', function(){
		it('empty root', function(){
			assert.equal(utils.normConfigDir(''), '/config/');
		});
		it('root with /', function(){
			assert.equal(utils.normConfigDir('/'), '/config/');
		});
		it('only dirname', function(){
			assert.equal(utils.normConfigDir('/opt/test'), '/opt/test/config/');
		});
		it('dirname with /', function(){
			assert.equal(utils.normConfigDir('/opt/test/'), '/opt/test/config/');
		});
		it('dirname with config', function(){
			assert.equal(utils.normConfigDir('/opt/test/config'), '/opt/test/config/');
		});
		it('dirname with config/', function(){
			assert.equal(utils.normConfigDir('/opt/test/config/'), '/opt/test/config/');
		});
		it('dirname with ..', function(){
			assert.equal(utils.normConfigDir('/opt/test/other/../'), '/opt/test/config/');
		});
		it('dirname with ../config/', function(){
			assert.equal(utils.normConfigDir('/opt/test/other/../config/'), '/opt/test/config/');
		});
	});

	describe('#baseNames', function(){
		it('NODE_ENV is development', function(){
			var env = {
				NODE_ENV: 'development'
			};
			var res = utils.baseNames(env);
			var exp = ["default","development","local","local-development"];
			assert.deepEqual(res, exp);
		});
		it('NODE_ENV is production and NODE_APP_INSTANCE is myserver', function(){
			var env = {
				NODE_ENV: 'production',
				NODE_APP_INSTANCE: '1'
			};
			var res = utils.baseNames(env);
			var exp = ["default","default-1","production","production-1","local","local-1","local-production","local-production-1"];
			assert.deepEqual(res, exp);
		});
		it('NODE_ENV is production and HOSTNAME is www1', function(){
			var env = {
				NODE_ENV: 'production',
				HOSTNAME: 'www'
			};
			var res = utils.baseNames(env);
			var exp = ["default","production","www","www-production","local","local-production"] ;
			assert.deepEqual(res, exp);
		});
		it('NODE_ENV is production, NODE_APP_INSTANCE is 2, HOSTNAME is www ', function(){
			var env = {
				NODE_ENV: 'production',
				NODE_APP_INSTANCE: '2',
				HOSTNAME: 'www'
			};
			var res = utils.baseNames(env);
			var exp = ["default","default-2","production","production-2","www","www-2","www-production","www-production-2","local","local-2","local-production","local-production-2"];
			assert.deepEqual(res, exp);
		});
	});

	describe('#discoverModuleNameVersion', function(){
		it('prj', function(){
			var res = utils.discoverModuleNameVersion(__dirname + '/fixtures/prj/config/');
			var exp = {"name":"sample-prj","version":"0.1.0"};
			assert.deepEqual(res, exp);
		});
		it('bad config dir', function(){
			var res;
			var exp = 'No package.json found in '+ __dirname +'/fixtures/prj/node_modules/';
			try {
				res = utils.discoverModuleNameVersion(__dirname + '/fixtures/prj/node_modules/configg/');
			} catch (e) {
				res = e;
			}
			assert.equal(res.message, exp);
		});
		it('module-a', function(){
			var res = utils.discoverModuleNameVersion(__dirname + '/fixtures/prj/node_modules/module-a/config/');
			var exp = {"name":"module-a","version":"0.1.0"};
			assert.deepEqual(res, exp);
		});
	});

	describe('#readDir', function(){
		it ('read existing dir', function(){
			var files = utils.readDir(__dirname + '/fixtures/');
			var exp = {"empty":1,"myapp":1,"prj":1,"test":1};

			function toObj(arr) {
				var tmp = {};
				arr.forEach(function(i){
					tmp[i] = 1;
				});
				return tmp;
			}

			//~ console.log(toObj(files));
			assert.deepEqual(toObj(files), exp);
		});
		it ('read from not existing dir', function(){
			var err;
			var exp = undefined;
			var res = utils.readDir(__dirname + '/fix/');
			assert.equal(res, exp);
		});
	});

	describe('#env', function(){
		it ('return desired values', function(){
			var env = {
				"NODE_ENV": "test",
				"NODE_APP_INSTANCE": 2,
				"HOSTNAME": "www",
				"OTHER": 0
			};
			var exp = {
				"NODE_ENV": "test",
				"NODE_APP_INSTANCE": 2,
				"HOSTNAME": "www",
			};
			var res = utils.env(env);
			assert.deepEqual(res, exp);
		});
		it ('return desired custom values', function(){
			var env = {
				"NODE_ENV": "test",
				"NODE_APP_INSTANCE": 2,
				"HOSTNAME": "www",
				"OTHER": 0
			};
			var exp = {
				"NODE_ENV": "test",
			};
			var res = utils.env(env, ['NODE_ENV']);
			assert.deepEqual(res, exp);
		});
	});

});

