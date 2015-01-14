/**
 * @copyright commenthol
 * @license MIT
 */

'use strict';

/* global describe, it */

var assert = require('assert');
var env = require('../lib/envvar');

describe('#envVar', function(){

	describe('resolve', function(){
		it('set default NODE_ENV',function(){
			assert.equal(env.resolve('NODE_ENV', 'development'), 'development');
		});
		it('get NODE_ENV from process.env.HOST',function(){
			process.env.NODE_ENV = 'staging';
			assert.equal(env.resolve('NODE_ENV', 'development'), 'staging');
		});
		it('get NODE_ENV from command line',function(){
			process.argv = [
				'node',
				__filename,
				'--NODE_ENV=production-cloud'
			];
			assert.equal(env.resolve('NODE_ENV', 'development'), 'production-cloud');
		});
		it('get CMD_WITH_SPACES from command line',function(){
			process.argv = [
				'node',
				__filename,
				'--CMD_WITH_SPACES=this has spaces'
			];
			assert.equal(env.resolve('CMD_WITH_SPACES'), 'this has spaces');
		});
	});

	describe('resolveHostname', function(){
		it('resolve hostname from HOST', function(){
			var exp = 'myserver';
			process.env.HOST = exp;
			delete process.env.HOSTNAME;

			assert.equal(process.env.HOST, exp);
			assert.equal(process.env.HOSTNAME, undefined);
			assert.equal(env.resolveHostname(),exp);
		});
		it('resolve hostname from HOSTNAME', function(){
			var exp = 'myserver';
			delete process.env.HOST;
			process.env.HOSTNAME = exp;

			assert.equal(process.env.HOST, undefined);
			assert.equal(process.env.HOSTNAME, exp);
			assert.equal(env.resolveHostname(),exp);
		});
		it('resolve hostname from OS', function(){
			delete process.env.HOST;
			delete process.env.HOSTNAME;

			assert.equal(process.env.HOST, undefined);
			assert.equal(process.env.HOSTNAME, undefined);
			assert.equal(env.resolveHostname(), require('os').hostname());
		});
		it('resolve hostname from HOST from commandline', function(){
			var exp = 'myserver';
			process.argv.push('--HOST=' + exp);

			assert.equal(env.resolveHostname(),exp);
		});
	});

	describe('extract', function(){
		it('extract env variables', function(){
			process.argv = [
				'node',
				__filename,
				'--NODE_ENV=prod',
				'--NODE_CONFIG_DIR=/opt/config',
				'--NODE_APP_INSTANCE=4',
				'--NODE_CONFIG={ "test": 1 }',
			];
			var res = env.setup();
			var exp = {
				NODE_ENV: "prod",
				NODE_CONFIG_DIR: "/opt/config",
				NODE_APP_INSTANCE: 4,
				NODE_CONFIG: '{ "test": 1 }',
			};

			//~ console.log(res);
			Object.keys(exp).forEach(function(p){
				assert.equal(res[p], exp[p]);
			});
		});

		it('relative NODE_CONFIG_DIR', function(){
			process.argv = [
				'node',
				__filename,
				'--NODE_CONFIG_DIR=./config',
			];
			var res = env.setup();
			var exp = {
				NODE_CONFIG_DIR: process.cwd() + "/config"
			};

			Object.keys(exp).forEach(function(p){
				assert.equal(res[p], exp[p]);
			});
		});

	});

});