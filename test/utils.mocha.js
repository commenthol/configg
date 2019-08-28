/**
 * @copyright commenthol
 * @license MIT
 */

'use strict'

const path = require('path')
const assert = require('assert')
const utils = require('../src/utils')

describe('#utils', function () {
  describe('#parseNodeConfig', function () {
    it('parse commandline config in HJSON', function () {
      const env = {
        NODE_CONFIG: '{ module: { database: { pass: "secret" } } }'
      }
      const exp = {
        module: {
          database: {
            pass: 'secret'
          }
        }
      }
      const res = utils.parseNodeConfig(env)
      assert.deepStrictEqual(res, exp)
    })
    it('parse commandline config in JSON', function () {
      const env = {
        NODE_CONFIG: '{ "module": { "database": { "pass": "secret" } } }'
      }
      const exp = {
        module: {
          database: {
            pass: 'secret'
          }
        }
      }
      const res = utils.parseNodeConfig(env)
      assert.deepStrictEqual(res, exp)
    })
    it('parse unset commandline config', function () {
      let exp
      const env = {}
      const res = utils.parseNodeConfig(env)
      assert.deepStrictEqual(res, exp)
    })
    it('parse bad commandline config', function () {
      const env = {
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
      const env = {
        NODE_ENV: 'development'
      }
      const res = utils.baseNames(env)
      const exp = ['default', 'development', 'local', 'local-development']
      assert.deepStrictEqual(res, exp)
    })
    it('NODE_ENV is production and NODE_APP_INSTANCE is myserver', function () {
      const env = {
        NODE_ENV: 'production',
        NODE_APP_INSTANCE: '1'
      }
      const res = utils.baseNames(env)
      const exp = ['default', 'default-1', 'production', 'production-1', 'local', 'local-1', 'local-production', 'local-production-1']
      assert.deepStrictEqual(res, exp)
    })
    it('NODE_ENV is production and HOSTNAME is www1', function () {
      const env = {
        NODE_ENV: 'production',
        HOSTNAME: 'www'
      }
      const res = utils.baseNames(env)
      const exp = ['default', 'production', 'www', 'www-production', 'local', 'local-production']
      assert.deepStrictEqual(res, exp)
    })
    it('NODE_ENV is production, NODE_APP_INSTANCE is 2, HOSTNAME is www ', function () {
      const env = {
        NODE_ENV: 'production',
        NODE_APP_INSTANCE: '2',
        HOSTNAME: 'www'
      }
      const res = utils.baseNames(env)
      const exp = ['default', 'default-2', 'production', 'production-2', 'www', 'www-2', 'www-production', 'www-production-2', 'local', 'local-2', 'local-production', 'local-production-2']
      assert.deepStrictEqual(res, exp)
    })
  })

  describe('#discoverModuleNameVersion', function () {
    it('prj', function () {
      const res = utils.discoverModuleNameVersion(path.join(__dirname, 'fixtures/prj/config/'))
      const exp = {
        name: 'sample-prj',
        version: '0.1.0'
      }
      assert.deepStrictEqual(res, exp)
    })
    it('bad config dir', function () {
      let res
      const exp = 'No package.json found in ' + path.join(__dirname, 'fixtures/prj/node_modules/')
      try {
        res = utils.discoverModuleNameVersion(path.join(__dirname, 'fixtures/prj/node_modules/configg/'))
      } catch (e) {
        res = e
      }
      assert.strictEqual(res.message, exp)
    })
    it('module-a', function () {
      const res = utils.discoverModuleNameVersion(path.join(__dirname, 'fixtures/prj/node_modules/module-a/config/'))
      const exp = {
        name: 'module-a',
        version: '0.1.0'
      }
      assert.deepStrictEqual(res, exp)
    })
  })

  describe('#readDir', function () {
    it('read existing dir', function () {
      const files = utils.readDir(path.join(__dirname, 'fixtures/'))
      const exp = {
        empty: 1,
        myapp: 1,
        prj: 1,
        test: 1,
        strictmode: 1,
        'plugin-vault-nacl': 1,
        'plugin-async': 1
      }

      function toObj (arr) {
        const tmp = {}
        arr.forEach(function (i) {
          tmp[i] = 1
        })
        return tmp
      }

      // ~ console.log(toObj(files));
      assert.deepStrictEqual(toObj(files), exp)
    })
    it('read from not existing dir', function () {
      let exp
      const res = utils.readDir(path.join(__dirname, 'fix/'))
      assert.strictEqual(res, exp)
    })
    it('read from not existing dir in strict mode', function () {
      let err
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
      const env = {
        NODE_ENV: 'test',
        NODE_APP_INSTANCE: 2,
        HOSTNAME: 'www',
        OTHER: 0
      }
      const exp = {
        NODE_ENV: 'test',
        NODE_APP_INSTANCE: 2,
        HOSTNAME: 'www'
      }
      const res = utils.env(env)
      assert.deepStrictEqual(res, exp)
    })
    it('return desired custom values', function () {
      const env = {
        NODE_ENV: 'test',
        NODE_APP_INSTANCE: 2,
        HOSTNAME: 'www',
        OTHER: 0
      }
      const exp = {
        NODE_ENV: 'test'
      }
      const res = utils.env(env, ['NODE_ENV'])
      assert.deepStrictEqual(res, exp)
    })
  })

  describe('#strictModeCheck', function () {
    it('no strict mode set', function () {
      const env = {
        NODE_ENV: 'development',
        NODE_APP_INSTANCE: 2,
        NODE_CONFIG_DIR: '.'
      }
      const filesFound = ['default', 'development', 'test', 'production', 'local']
      const res = utils.strictModeCheck(env, filesFound)
      assert.ok(res)
    })
    it('NODE_ENV is default', function () {
      const env = {
        NODE_CONFIG_STRICT_MODE: 1,
        NODE_ENV: 'default',
        NODE_APP_INSTANCE: 2,
        NODE_CONFIG_DIR: '.'
      }
      const filesFound = ['default', 'development', 'test', 'production', 'local']

      const res = utils.strictModeCheck(env, filesFound)
      assert.ok(!res)
    })
    it('NODE_ENV is local', function () {
      const env = {
        NODE_CONFIG_STRICT_MODE: 1,
        NODE_ENV: 'local',
        NODE_APP_INSTANCE: 2,
        NODE_CONFIG_DIR: '.'
      }
      const filesFound = ['default', 'development', 'test', 'production', 'local']

      const res = utils.strictModeCheck(env, filesFound)
      assert.ok(!res)
    })
    it('NODE_ENV is development', function () {
      const env = {
        NODE_CONFIG_STRICT_MODE: 1,
        NODE_ENV: 'development',
        NODE_APP_INSTANCE: 2,
        NODE_CONFIG_DIR: '.'
      }
      const filesFound = ['default', 'development', 'test', 'production', 'local']

      const res = utils.strictModeCheck(env, filesFound)
      assert.ok(res)
    })
    it('NODE_ENV is production and file exists', function () {
      const env = {
        NODE_CONFIG_STRICT_MODE: 1,
        NODE_ENV: 'production',
        NODE_CONFIG_DIR: '.'
      }
      const filesFound = ['default', 'development', 'test', 'production', 'local']

      const res = utils.strictModeCheck(env, filesFound)
      assert.ok(res)
    })
    it('NODE_ENV is production and file not exists', function () {
      const env = {
        NODE_CONFIG_STRICT_MODE: 1,
        NODE_ENV: 'production',
        NODE_CONFIG_DIR: '.'
      }
      const filesFound = ['default', 'development', 'test', 'preproduction', 'local']

      const res = utils.strictModeCheck(env, filesFound)
      assert.ok(!res)
    })
    it('NODE_ENV is production, NODE_APP_INSTANCE is 2 and file exists', function () {
      const env = {
        NODE_CONFIG_STRICT_MODE: 1,
        NODE_ENV: 'production',
        NODE_APP_INSTANCE: 2,
        NODE_CONFIG_DIR: '.'
      }
      const filesFound = ['default', 'development', 'test', 'production-2', 'local']

      const res = utils.strictModeCheck(env, filesFound)
      assert.ok(res)
    })
    it('NODE_ENV is production, NODE_APP_INSTANCE is 2 and file not exists', function () {
      const env = {
        NODE_CONFIG_STRICT_MODE: 1,
        NODE_ENV: 'production',
        NODE_APP_INSTANCE: 2,
        NODE_CONFIG_DIR: '.'
      }
      const filesFound = ['default', 'development', 'test', 'production-1', 'local']

      const res = utils.strictModeCheck(env, filesFound)
      assert.ok(!res)
    })
    it('NODE_ENV is production, NODE_APP_INSTANCE is 2, HOSTNAME is server and file exists', function () {
      const env = {
        NODE_CONFIG_STRICT_MODE: 'HOSTNAME',
        NODE_ENV: 'production',
        HOSTNAME: 'server',
        NODE_APP_INSTANCE: 2,
        NODE_CONFIG_DIR: '.'
      }
      const filesFound = ['default', 'server-production-2']

      const res = utils.strictModeCheck(env, filesFound)
      assert.ok(res)
    })
    it('NODE_ENV is production, NODE_APP_INSTANCE is 2, HOSTNAME is server and file not exists', function () {
      const env = {
        NODE_CONFIG_STRICT_MODE: 'HOSTNAME',
        NODE_ENV: 'production',
        HOSTNAME: 'server',
        NODE_APP_INSTANCE: 2,
        NODE_CONFIG_DIR: '.'
      }
      const filesFound = ['default', 'myserver-production-2']

      const res = utils.strictModeCheck(env, filesFound)
      assert.ok(!res)
    })
  })

  describe('#debugConfig', function () {
    it('shall output functions', function () {
      const config = { config: { fn: function (test) { return test } } }
      const res = utils.debugConfig(__dirname, config)
      const exp = '{\n  "config": {\n    "fn": "function (test) { return test }"\n  }\n}'
      assert.strictEqual(res, exp)
    })
    it('shall output Buffer base64 encoded', function () {
      const config = { config: { buffer: Buffer.from('abcdef') } }
      const res = utils.debugConfig(__dirname, config)
      const exp = '{\n  "config": {\n    "buffer": "Buffer(\'YWJjZGVm\')"\n  }\n}'
      assert.strictEqual(res, exp)
    })
  })
})
