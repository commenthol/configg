/**
 * @copyright commenthol
 * @license MIT
 */

'use strict'

/* global describe, it */

var path = require('path')
var assert = require('assert')
var utils = require('../src/utils')

describe('#utils', function () {
  describe('#parseNodeConfig', function () {
    it('parse commandline config in HJSON', function () {
      var env = {
        NODE_CONFIG: '{ module: { database: { pass: "secret" } } }'
      }
      var exp = {
        module: {
          database: {
            pass: 'secret'
          }
        }
      }
      var res = utils.parseNodeConfig(env)
      assert.deepStrictEqual(res, exp)
    })
    it('parse commandline config in JSON', function () {
      var env = {
        NODE_CONFIG: '{ "module": { "database": { "pass": "secret" } } }'
      }
      var exp = {
        module: {
          database: {
            pass: 'secret'
          }
        }
      }
      var res = utils.parseNodeConfig(env)
      assert.deepStrictEqual(res, exp)
    })
    it('parse unset commandline config', function () {
      var env = {}
      var exp
      var res = utils.parseNodeConfig(env)
      assert.deepStrictEqual(res, exp)
    })
    it('parse bad commandline config', function () {
      var env = {
        NODE_CONFIG: '{ "module: { database": { "pass": "secret" } } }'
      }
      assert.throws(function () {
        utils.parseNodeConfig(env)
      })
    })
  })

  describe('#normConfigDir', function () {
    it('empty root', function () {
      assert.strictEqual(utils.normConfigDir(''), '/config/')
    })
    it('root with /', function () {
      assert.strictEqual(utils.normConfigDir('/'), '/config/')
    })
    it('only dirname', function () {
      assert.strictEqual(utils.normConfigDir('/opt/test'), '/opt/test/config/')
    })
    it('dirname with /', function () {
      assert.strictEqual(utils.normConfigDir('/opt/test/'), '/opt/test/config/')
    })
    it('dirname with config', function () {
      assert.strictEqual(utils.normConfigDir('/opt/test/config'), '/opt/test/config/')
    })
    it('dirname with config/', function () {
      assert.strictEqual(utils.normConfigDir('/opt/test/config/'), '/opt/test/config/')
    })
    it('dirname with ..', function () {
      assert.strictEqual(utils.normConfigDir('/opt/test/other/../'), '/opt/test/config/')
    })
    it('dirname with ../config/', function () {
      assert.strictEqual(utils.normConfigDir('/opt/test/other/../config/'), '/opt/test/config/')
    })
  })

  describe('#baseNames', function () {
    it('NODE_ENV is development', function () {
      var env = {
        NODE_ENV: 'development'
      }
      var res = utils.baseNames(env)
      var exp = ['default', 'development', 'local', 'local-development']
      assert.deepStrictEqual(res, exp)
    })
    it('NODE_ENV is production and NODE_APP_INSTANCE is myserver', function () {
      var env = {
        NODE_ENV: 'production',
        NODE_APP_INSTANCE: '1'
      }
      var res = utils.baseNames(env)
      var exp = ['default', 'default-1', 'production', 'production-1', 'local', 'local-1', 'local-production', 'local-production-1']
      assert.deepStrictEqual(res, exp)
    })
    it('NODE_ENV is production and HOSTNAME is www1', function () {
      var env = {
        NODE_ENV: 'production',
        HOSTNAME: 'www'
      }
      var res = utils.baseNames(env)
      var exp = ['default', 'production', 'www', 'www-production', 'local', 'local-production']
      assert.deepStrictEqual(res, exp)
    })
    it('NODE_ENV is production, NODE_APP_INSTANCE is 2, HOSTNAME is www ', function () {
      var env = {
        NODE_ENV: 'production',
        NODE_APP_INSTANCE: '2',
        HOSTNAME: 'www'
      }
      var res = utils.baseNames(env)
      var exp = ['default', 'default-2', 'production', 'production-2', 'www', 'www-2', 'www-production', 'www-production-2', 'local', 'local-2', 'local-production', 'local-production-2']
      assert.deepStrictEqual(res, exp)
    })
  })

  describe('#discoverModuleNameVersion', function () {
    it('prj', function () {
      var res = utils.discoverModuleNameVersion(path.join(__dirname, 'fixtures/prj/config/'))
      var exp = {
        'name': 'sample-prj',
        'version': '0.1.0'
      }
      assert.deepStrictEqual(res, exp)
    })
    it('bad config dir', function () {
      var res
      var exp = 'No package.json found in ' + path.join(__dirname, 'fixtures/prj/node_modules/')
      try {
        res = utils.discoverModuleNameVersion(path.join(__dirname, 'fixtures/prj/node_modules/configg/'))
      } catch (e) {
        res = e
      }
      assert.strictEqual(res.message, exp)
    })
    it('module-a', function () {
      var res = utils.discoverModuleNameVersion(path.join(__dirname, 'fixtures/prj/node_modules/module-a/config/'))
      var exp = {
        'name': 'module-a',
        'version': '0.1.0'
      }
      assert.deepStrictEqual(res, exp)
    })
  })

  describe('#readDir', function () {
    it('read existing dir', function () {
      var files = utils.readDir(path.join(__dirname, 'fixtures/'))
      var exp = {
        'empty': 1,
        'myapp': 1,
        'prj': 1,
        'test': 1,
        'strictmode': 1
      }

      function toObj (arr) {
        var tmp = {}
        arr.forEach(function (i) {
          tmp[i] = 1
        })
        return tmp
      }

      // ~ console.log(toObj(files));
      assert.deepStrictEqual(toObj(files), exp)
    })
    it('read from not existing dir', function () {
      var exp
      var res = utils.readDir(path.join(__dirname, 'fix/'))
      assert.strictEqual(res, exp)
    })
    it('read from not existing dir in strict mode', function () {
      var err
      try {
        utils.readDir(path.join(__dirname, 'fix/'), true)
      } catch (e) {
        err = e
      }
      assert.strictEqual(err.message, 'strict mode failed!')
    })
  })

  describe('#env', function () {
    it('return desired values', function () {
      var env = {
        'NODE_ENV': 'test',
        'NODE_APP_INSTANCE': 2,
        'HOSTNAME': 'www',
        'OTHER': 0
      }
      var exp = {
        'NODE_ENV': 'test',
        'NODE_APP_INSTANCE': 2,
        'HOSTNAME': 'www'
      }
      var res = utils.env(env)
      assert.deepStrictEqual(res, exp)
    })
    it('return desired custom values', function () {
      var env = {
        'NODE_ENV': 'test',
        'NODE_APP_INSTANCE': 2,
        'HOSTNAME': 'www',
        'OTHER': 0
      }
      var exp = {
        'NODE_ENV': 'test'
      }
      var res = utils.env(env, ['NODE_ENV'])
      assert.deepStrictEqual(res, exp)
    })
  })

  describe('#strictModeCheck', function () {
    it('no strict mode set', function () {
      var env = {
        'NODE_ENV': 'development',
        'NODE_APP_INSTANCE': 2,
        'NODE_CONFIG_DIR': '.'
      }
      var filesFound = ['default', 'development', 'test', 'production', 'local']
      var res = utils.strictModeCheck(env, filesFound)
      assert.ok(res)
    })
    it('NODE_ENV is default', function () {
      var env = {
        'NODE_CONFIG_STRICT_MODE': 1,
        'NODE_ENV': 'default',
        'NODE_APP_INSTANCE': 2,
        'NODE_CONFIG_DIR': '.'
      }
      var filesFound = ['default', 'development', 'test', 'production', 'local']

      var res = utils.strictModeCheck(env, filesFound)
      assert.ok(!res)
    })
    it('NODE_ENV is local', function () {
      var env = {
        'NODE_CONFIG_STRICT_MODE': 1,
        'NODE_ENV': 'local',
        'NODE_APP_INSTANCE': 2,
        'NODE_CONFIG_DIR': '.'
      }
      var filesFound = ['default', 'development', 'test', 'production', 'local']

      var res = utils.strictModeCheck(env, filesFound)
      assert.ok(!res)
    })
    it('NODE_ENV is development', function () {
      var env = {
        'NODE_CONFIG_STRICT_MODE': 1,
        'NODE_ENV': 'development',
        'NODE_APP_INSTANCE': 2,
        'NODE_CONFIG_DIR': '.'
      }
      var filesFound = ['default', 'development', 'test', 'production', 'local']

      var res = utils.strictModeCheck(env, filesFound)
      assert.ok(res)
    })
    it('NODE_ENV is production and file exists', function () {
      var env = {
        'NODE_CONFIG_STRICT_MODE': 1,
        'NODE_ENV': 'production',
        'NODE_CONFIG_DIR': '.'
      }
      var filesFound = ['default', 'development', 'test', 'production', 'local']

      var res = utils.strictModeCheck(env, filesFound)
      assert.ok(res)
    })
    it('NODE_ENV is production and file not exists', function () {
      var env = {
        'NODE_CONFIG_STRICT_MODE': 1,
        'NODE_ENV': 'production',
        'NODE_CONFIG_DIR': '.'
      }
      var filesFound = ['default', 'development', 'test', 'preproduction', 'local']

      var res = utils.strictModeCheck(env, filesFound)
      assert.ok(!res)
    })
    it('NODE_ENV is production, NODE_APP_INSTANCE is 2 and file exists', function () {
      var env = {
        'NODE_CONFIG_STRICT_MODE': 1,
        'NODE_ENV': 'production',
        'NODE_APP_INSTANCE': 2,
        'NODE_CONFIG_DIR': '.'
      }
      var filesFound = ['default', 'development', 'test', 'production-2', 'local']

      var res = utils.strictModeCheck(env, filesFound)
      assert.ok(res)
    })
    it('NODE_ENV is production, NODE_APP_INSTANCE is 2 and file not exists', function () {
      var env = {
        'NODE_CONFIG_STRICT_MODE': 1,
        'NODE_ENV': 'production',
        'NODE_APP_INSTANCE': 2,
        'NODE_CONFIG_DIR': '.'
      }
      var filesFound = ['default', 'development', 'test', 'production-1', 'local']

      var res = utils.strictModeCheck(env, filesFound)
      assert.ok(!res)
    })
    it('NODE_ENV is production, NODE_APP_INSTANCE is 2, HOSTNAME is server and file exists', function () {
      var env = {
        'NODE_CONFIG_STRICT_MODE': 'HOSTNAME',
        'NODE_ENV': 'production',
        'HOSTNAME': 'server',
        'NODE_APP_INSTANCE': 2,
        'NODE_CONFIG_DIR': '.'
      }
      var filesFound = ['default', 'server-production-2']

      var res = utils.strictModeCheck(env, filesFound)
      assert.ok(res)
    })
    it('NODE_ENV is production, NODE_APP_INSTANCE is 2, HOSTNAME is server and file not exists', function () {
      var env = {
        'NODE_CONFIG_STRICT_MODE': 'HOSTNAME',
        'NODE_ENV': 'production',
        'HOSTNAME': 'server',
        'NODE_APP_INSTANCE': 2,
        'NODE_CONFIG_DIR': '.'
      }
      var filesFound = ['default', 'myserver-production-2']

      var res = utils.strictModeCheck(env, filesFound)
      assert.ok(!res)
    })
  })
})
