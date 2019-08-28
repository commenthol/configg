/**
 * @copyright commenthol
 * @license MIT
 */

'use strict'

var assert = require('assert')
var env = require('../src/envvar')

describe('#envVar', function () {
  describe('resolve', function () {
    before(function () {
      process.env = {}
    })

    it('set default NODE_ENV', function () {
      assert.strictEqual(env.resolve('NODE_ENV', 'development'), 'development')
    })
    it('get NODE_ENV from process.env.NODE_ENV', function () {
      process.env.NODE_ENV = 'staging'
      assert.strictEqual(env.resolve('NODE_ENV', 'development'), 'staging')
    })
    it('get NODE_ENV from command line', function () {
      process.argv = [
        'node',
        __filename,
        '--NODE_ENV=production-cloud'
      ]
      assert.strictEqual(env.resolve('NODE_ENV', 'development'), 'production-cloud')
    })
    it('get CMD_WITH_SPACES from command line', function () {
      process.argv = [
        'node',
        __filename,
        '--CMD_WITH_SPACES=this has spaces'
      ]
      assert.strictEqual(env.resolve('CMD_WITH_SPACES'), 'this has spaces')
    })
  })

  describe('resolveHostname', function () {
    it('resolve hostname from HOSTNAME', function () {
      var exp = 'myserver'
      process.env.HOSTNAME = exp

      assert.strictEqual(process.env.HOSTNAME, exp)
      assert.strictEqual(env.resolveHostname(), exp)
    })
    it('resolve hostname from OS', function () {
      delete process.env.HOSTNAME

      assert.strictEqual(process.env.HOSTNAME, undefined)
      assert.strictEqual(env.resolveHostname(), require('os').hostname())
    })
    it('resolve hostname from HOSTNAME from commandline', function () {
      var exp = 'myserver'
      process.argv.push('--HOSTNAME=' + exp)

      assert.strictEqual(env.resolveHostname(), exp)
    })
  })

  describe('extract', function () {
    it('extract env variables', function () {
      process.argv = [
        'node',
        __filename,
        '--NODE_ENV=prod',
        '--NODE_CONFIG_DIR=/opt/config',
        '--NODE_APP_INSTANCE=4',
        '--NODE_CONFIG={ "test": 1 }'
      ]
      var res = env.setup()
      var exp = {
        NODE_ENV: 'prod',
        NODE_CONFIG_DIR: '/opt/config',
        NODE_APP_INSTANCE: '4',
        NODE_CONFIG: '{ "test": 1 }'
      }

      Object.keys(exp).forEach(function (p) {
        assert.strictEqual(res[p], exp[p])
      })
    })

    it('relative NODE_CONFIG_DIR', function () {
      process.argv = [
        'node',
        __filename,
        '--NODE_CONFIG_DIR=./config'
      ]
      var res = env.setup()
      var exp = {
        NODE_CONFIG_DIR: process.cwd() + '/config'
      }

      Object.keys(exp).forEach(function (p) {
        assert.strictEqual(res[p], exp[p])
      })
    })
  })

  describe('delete', function () {
    it('delete arguments', function () {
      process.argv = [
        'node',
        __filename,
        '--NODE_ENV=prod',
        '--NODE_CONFIG_DIR=/opt/config',
        '--NODE_APP_INSTANCE=4',
        '--NODE_CONFIG={ "test": 1 }'
      ]
      env.delvars()
      var exp = ['--NODE_ENV=prod', 'DEL', '--NODE_APP_INSTANCE=4', 'DEL']

      assert.deepStrictEqual(process.argv.slice(2), exp)
    })

    it('delete env vars', function () {
      process.env.NODE_ENV = 'prod'
      process.env.NODE_CONFIG_DIR = '/opt/config'
      process.env.NODE_APP_INSTANCE = 4
      process.env.NODE_CONFIG = '{ "test": 1 }'

      env.delvars()
      var exp = {
        NODE_ENV: 'prod',
        NODE_CONFIG_DIR: undefined,
        NODE_APP_INSTANCE: 4,
        NODE_CONFIG: undefined
      }

      Object.keys(exp).forEach(function (p) {
        assert.strictEqual(process.env[p], exp[p])
      })
    })
  })
})
