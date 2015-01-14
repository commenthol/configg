/**
 * @copyright commenthol
 * @license MIT
 */

'use strict';

/* global describe, it, beforeEach */

var fs = require('fs');
var assert = require('assert');
var Config = require('../lib/config');

describe('#config', function(){

	beforeEach(function(){
		// overwrite any possible env setings
		'NODE_ENV NODE_CONFIG NODE_CONFIG_DIR'.split(' ')
		.forEach(function(p){
			delete(process.env[p]);
		});
		process.env.HOST = 'server';
	});

	describe('load configs', function(){

		it('module-a config', function(){
			var cconfig = new Config();
			var config = cconfig.dir(__dirname + '/fixtures/prj/node_modules/module-a');
			var exp = {
				"config": {
					"module-a": "origin",
					"override": "module-a",
					"url": "xtp://module-a"
				},
				"common": {
					"module": "module-a",
					"type": "default"
				}
			};
			assert.deepEqual(config, exp);
		});

		it('module-b config', function(){
			var cconfig = new Config();
			var config = cconfig.dir(__dirname + '/fixtures/prj/node_modules/module-b');
			var exp = {
				"config": {
					"module-b": "origin",
					"override": "module-b",
					"url": "xtp://module-b"
				},
				"common": {
					"module": "module-b",
					"type": "default"
				}
			};

			assert.deepEqual(config, exp);
		});

		it('module-c config', function(){
			var cconfig = new Config();
			var config = cconfig.dir(__dirname + '/fixtures/prj/node_modules/module-a/node_modules/module-c');
			var exp = {
				"config": {
					"module-c": "origin",
					"override": "module-c",
					"url": "xtp://module-c"
				},
				"common": {
					"module": "module-c",
					"type": "default"
				}
			};

			assert.deepEqual(config, exp);
		});

		it('module-c config merged with module-a', function(){
			var cconfig = new Config();
			var configA  = cconfig.dir(__dirname + '/fixtures/prj/node_modules/module-a', true);
			var configAC = cconfig.dir(__dirname + '/fixtures/prj/node_modules/module-a/node_modules/module-c');
			var expA = {
				"config": {
					"module-a": "origin",
					"override": "module-a",
					"url": "xtp://module-a"
				},
				"common": {
					"module": "module-a",
					"type": "default"
				}
			};
			var expAC = {
				"config": {
					"module-c": "origin",
					"override": "module-a",
					"url": "xtp://module-c",
					"module-a": "origin"
				},
				"common": {
					"module": "module-a",
					"type": "default"
				}
			};

			assert.deepEqual(configA,  expA);
			assert.deepEqual(configAC, expAC);
		});

		it('module-c config merged with module-b', function(){
			var cconfig = new Config();
			var configB  = cconfig.dir(__dirname + '/fixtures/prj/node_modules/module-b', true);
			var configBC = cconfig.dir(__dirname + '/fixtures/prj/node_modules/module-b/node_modules/module-c');
			var expB = {
				"config": {
					"module-b": "origin",
					"override": "module-b",
					"url": "xtp://module-b"
				},
				"common": {
					"module": "module-b",
					"type": "default"
				}
			};
			var expBC = {
				"config": {
					"module-c@0.1.2": "origin",
					"override": "module-b",
					"url": "xtp://module-c",
					"v0.1.2": "only",
					"module-b": "origin"
				},
				"common": {
					"module": "module-b",
					"type": "default"
				}
			};

			assert.deepEqual(configB,  expB);
			assert.deepEqual(configBC, expBC);
		});

		it('sample-prj config', function(){
			var cconfig = new Config();
			var config   = cconfig.dir(__dirname + '/fixtures/prj', true);
			var configA  = cconfig.dir(__dirname + '/fixtures/prj/node_modules/module-a');
			var configB  = cconfig.dir(__dirname + '/fixtures/prj/node_modules/module-b');
			var configAC = cconfig.dir(__dirname + '/fixtures/prj/node_modules/module-a/node_modules/module-c');
			var configBC = cconfig.dir(__dirname + '/fixtures/prj/node_modules/module-b/node_modules/module-c');

			var exp = {
				"config": {
					"prj-default": "origin",
					"override": "prj-default"
				},
				"common": {
					"module": "prj",
					"type": "default"
				}
			};
			var expA = {
				"config": {
					"module-a": "origin",
					"override": "prj-default",
					"url": "xtp://module-a",
					"prj-default": "origin"
				},
				"common": {
					"module": "prj",
					"type": "default"
				}
			};
			var expB = {
				"config": {
					"module-b": "origin",
					"override": "prj-default",
					"url": "xtp://module-b",
					"prj-default": "origin"
				},
				"common": {
					"module": "prj",
					"type": "default"
				}
			};
			var expAC = {
				"config": {
					"module-c": "origin",
					"override": "prj-default",
					"url": "xtp://module-c",
					"prj-default": "origin"
				},
				"common": {
					"module": "prj",
					"type": "default"
				}
			};
			var expBC = {
				"config": {
					"module-c@0.1.2": "origin",
					"override": "prj-default",
					"url": "xtp://module-c",
					"v0.1.2": "only",
					"prj-default": "v0.1.2 only"
				},
				"common": {
					"module": "prj",
					"type": "default"
				}
			};

			//~ console.log(JSON.stringify(config, null, '\t'))
			assert.deepEqual(config,   exp);
			assert.deepEqual(configA,  expA);
			assert.deepEqual(configB,  expB);
			assert.deepEqual(configAC, expAC);
			assert.deepEqual(configBC, expBC);
		});

		it('with NODE_CONFIG_DIR', function(){
			process.env.NODE_CONFIG_DIR = __dirname + '/fixtures/prj/config';

			var cconfig = new Config();
			var exp = {
				"name": "",
				"version": "0.0.0",
				"dirname": "NODE_CONFIG_DIR",
				"obj": {
					"sample-prj": {
						"prj-default": "origin",
						"override": "prj-default"
					},
					"module-a": {
						"prj-default": "origin",
						"override": "prj-default"
					},
					"module-b": {
						"prj-default": "origin",
						"override": "prj-default"
					},
					"module-c": {
						"prj-default": "origin",
						"override": "prj-default"
					},
					"module-c@0.1.2": {
						"prj-default": "v0.1.2 only",
						"override": "prj-default"
					},
					"common": {
						"module": "prj",
						"type": "default"
					}
				}
			};

			assert.deepEqual(cconfig._entriesApp[1], exp);
		});

		it('module-a with NODE_CONFIG_DIR', function(){
			process.env.NODE_CONFIG_DIR = __dirname + '/fixtures/prj/config';

			var cconfig = new Config();
			var config = cconfig.dir(__dirname + '/fixtures/prj/node_modules/module-a');
			var exp = {
				"config": {
					"module-a": "origin",
					"override": "prj-default",
					"url": "xtp://module-a",
					"prj-default": "origin"
				},
				"common": {
					"module": "prj",
					"type": "default"
				}
			};

			//~ console.log(JSON.stringify(config, null, '\t'));
			assert.deepEqual(config, exp);
		});

		it('module-a with NODE_CONFIG', function(){
			process.env.NODE_CONFIG = '{ "module-a": { "NODE_CONFIG": "origin" }, common: { "NODE_CONFIG": "origin" } }';
			var cconfig = new Config();
			var config = cconfig.dir(__dirname + '/fixtures/prj/node_modules/module-a');
			var exp = {
				"config": {
					"module-a": "origin",
					"override": "module-a",
					"url": "xtp://module-a",
					"NODE_CONFIG": "origin"
				},
				"common": {
					"module": "module-a",
					"type": "default",
					"NODE_CONFIG": "origin"
				}
			};

			//~ console.log(JSON.stringify(config, null, '\t'));
			assert.deepEqual(config, exp);
		});

		it('module-a with NODE_CONFIG which has a get property throws error', function(){
			var err;

			process.env.NODE_CONFIG = '{ "module-a": { "NODE_CONFIG": "origin", get: "test" }, common: { "NODE_CONFIG": "origin" } }';

			try {
				var cconfig = new Config();
				var config = cconfig.dir(__dirname + '/fixtures/prj/node_modules/module-a');
			} catch (e) {
				err = e;
			}
			assert.equal(err.message, "get method already defined");
		});

		it('from empty directory', function(){
			var dirname = __dirname + '/fixtures/empty';
			try {
				fs.mkdirSync(dirname + '/config/');
			} catch(e) {
			}
			var cconfig = new Config();
			var config = cconfig.dir(dirname);
			var exp = {
				"config": undefined,
				"common": undefined
			};
			assert.deepEqual(config, exp);
		});
	});

	describe('load files', function(){
		describe('for myapp', function(){
			var cconfig = new Config();
			var config = cconfig.dir(__dirname + '/fixtures/myapp', true);
			var exp = {
				"config": {
					"database": {
						"host": "dbhost",
						"name": "dbtest",
						"port": 1529,
					},
					"array": [
						1,
						"2",
						3.01
					],
					"local": 1
				},
				"common": {
					"value": "test",
					"local": 3
				}
			};

			it('loads config', function(){
				assert.deepEqual(config, exp);
			});
			it('gets config value', function(){
				assert.deepEqual(config.get('config.database.host'), exp.config.database.host);
			});
			it('gets config value from config', function(){
				assert.deepEqual(config.config.get(['database','host']), exp.config.database.host);
			});
			it('gets config value from common', function(){
				assert.deepEqual(config.common.get('value'), exp.common.value);
			});
			it('undefined config value', function(){
				assert.deepEqual(config.get('config.notExists'), undefined);
			});
			it('undefined key returns config', function(){
				assert.deepEqual(config.get(), exp);
			});
			it('merge new value with config', function(){
				config.merge({'newkey':'newval'});
				assert.deepEqual(config.newkey, 'newval');
			});
			it('merge new value config.config', function(){
				config.config.merge({'newkey':'newval'});
				assert.deepEqual(config.config.newkey, 'newval');
			});
			it('merge new value config.common', function(){
				config.common.merge({'newkey':'newval'});
				assert.deepEqual(config.common.newkey, 'newval');
			});
		});

		it('for myapp in production', function() {
			process.env.NODE_ENV = 'production';

			var cconfig = new Config();
			var config = cconfig.dir(__dirname + '/fixtures/myapp', true);
			var exp = {
				"config": {
					"database": {
						"host": "dbhost-prod",
						"name": "dbprod",
						"port": 1529,
					},
					"array": [
						1,
						"2",
						3.01
					],
					"local": 1
				},
				"common": {
					"value": "production",
					"production": "filename",
					"local": 3
				}
			};

			//~ console.log(JSON.stringify(config,null,'\t'))
			assert.deepEqual(config, exp);
		});

		it('for myapp on host myserver', function() {
			process.env.HOST = 'myserver';

			var cconfig = new Config();
			var config = cconfig.dir(__dirname + '/fixtures/myapp', true);
			var exp = {
				"config": {
					"database": {
						"host": "dbhost-myserver",
						"name": "dbmyserver",
						"port": 1529,
					},
					"array": [
						1,
						"2",
						3.01
					],
					"local": 1
				},
				"common": {
					"value": "test",
					"local": 3
				}
			};

			//~ console.log(JSON.stringify(config,null,'\t'))
			assert.deepEqual(config, exp);
		});

		it('for myapp in production on host myserver', function() {
			process.env.NODE_ENV = 'production';
			process.env.HOST = 'myserver';

			var cconfig = new Config();
			var config = cconfig.dir(__dirname + '/fixtures/myapp', true);
			var exp = {
				"config": {
					"database": {
						"host": "dbhost-myserver-prod",
						"name": "dbmyserverprod",
						"port": 1529,
					},
					"array": [
						1,
						"2",
						3.01
					],
					"local": 1
				},
				"common": {
					"value": "production",
					"production": "filename",
					"local": 3
				}
			};

			//~ console.log(JSON.stringify(config,null,'\t'))
			assert.deepEqual(config, exp);
		});

		it('for module test', function(){
			var cconfig = new Config();
			var config = cconfig.dir(__dirname + '/fixtures/test');
			var exp = {
				"config": {
					"url": "http://default/",
					"local": 2
				},
				"common": {
					"value": "test",
					"local": 3
				}
			};

			assert.deepEqual(config, exp);
		});

		it('for module test in app context of myapp', function(){
			var cconfig = new Config();
			// first "require" from myapp
			cconfig.dir(__dirname + '/fixtures/myapp', true);
			// second "require" from module "test"
			var config = cconfig.dir(__dirname + '/fixtures/test');
			var exp = {
				"config": {
					"url": "http://foo.bar/",
					"local": 2,
					"cors": false
				},
				"common": {
					"value": "test",
					"local": 3
				}
			};

			assert.deepEqual(config, exp);
		});
	});

	describe('error cases', function(){
		it('config required as app-config twice', function(){
			var err;
			var exp = "App Config is already set by " + __dirname +
				"/fixtures/myapp/config/ - overwrite by " + __dirname +
				"/fixtures/test/config/ is not allowed";
			try {
				var cconfig = new Config();
				var confApp = cconfig.dir(__dirname + '/fixtures/myapp', true);
				var confMod = cconfig.dir(__dirname + '/fixtures/test', true);
			} catch (e) {
				err = e;
			}

			assert.equal(err.message, exp);
		});
		it('module requires config before app', function(){
			var err;
			var exp = "Setting Module Config before App Config by " + __dirname +
				"/fixtures/test/config/ is not allowed";
			try {
				var cconfig = new Config();
				var confMod = cconfig.dir(__dirname + '/fixtures/test');
				var confApp = cconfig.dir(__dirname + '/fixtures/myapp', true);
			} catch (e) {
				err = e;
			}

			assert.equal(err.message, exp);
		});
	});
});
