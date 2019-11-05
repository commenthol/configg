const assert = require('assert')
const path = require('path')
const { spawn } = require('child_process')
const _merge = require('lodash.merge')

const Config = require('../src/config')

function exec (command, args) {
  return new Promise((resolve, reject) => {
    const sub = spawn(command, args)
    sub.stdout.on('data', data => console.log(data.toString()))
    sub.stderr.on('data', data => console.error(data.toString()))
    sub.on('close', code => resolve(code))
    sub.on('error', err => reject(err))
  })
}

function npmInstall () {
  return exec('npm', ['install', 'deasync'])
}

function npmUninstall () {
  return exec('npm', ['uninstall', 'deasync'])
}

describe('plugin-async', function () {
  beforeEach(function () {
    Reflect.deleteProperty(process.env, 'NODE_ENV')
    Reflect.deleteProperty(process.env, 'NODE_CONFIG_STRICT_MODE')
    Reflect.deleteProperty(process.env, 'NODE_APP_INSTANCE')
  })

  describe('run without peer dependency deasync', function () {
    const dir = path.join(__dirname, 'fixtures/plugin-async/config')

    it('shall throw error', function () {
      _merge(process.env, {
        NODE_CONFIG_DIR: dir
      })
      assert.throws(() => {
        const cconfig = new Config()
        const config = cconfig.dir(dir)
        assert.ok(config)
      }, /async plugin detected; npm install deasync/)
    })
  })

  describe('run with peer dependency deasync', function () {
    const dir = path.join(__dirname, 'fixtures/plugin-async/config')

    before(function () {
      this.timeout(8000)
      return npmInstall()
    })
    after(function () {
      this.timeout(8000)
      return npmUninstall()
    })

    it('shall run plugin asynchronously', function () {
      _merge(process.env, {
        NODE_CONFIG_DIR: dir
      })
      const cconfig = new Config()
      const config = cconfig.dir(dir)
      const exp = {
        config: {
          default: true,
          plugin: true
        },
        common: {
          NODE_ENV: 'development',
          NODE_APP_INSTANCE: undefined,
          HOSTNAME: 'server'
        }
      }
      assert.deepStrictEqual(config, exp)
    })
  })
})
