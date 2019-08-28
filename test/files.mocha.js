/**
 * @copyright commenthol
 * @license MIT
 */

'use strict'

const assert = require('assert')
const File = require('../src/files')
const path = require('path')

const confDir = path.join(__dirname, 'fixtures/myapp/config/')

function assertObj (file) {
  const obj = file.obj
  assert.strictEqual(obj.config.database.host, 'dbhost')
  assert.strictEqual(obj.config.database.name, 'dbtest')
  assert.strictEqual(obj.config.database.port, 1529)
  assert.deepStrictEqual(obj.config.array, [1, '2', 3.01])
  assert.strictEqual(obj.common.value, 'test')
  assert.strictEqual(file.error, undefined)
}

describe('#File', function () {
  describe('tests', function () {
    it('construct without new', function () {
      const file = File() // jshint ignore:line
      assert.ok(file instanceof File)
    })
    it('get right order of extensions', function () {
      const file = new File()
      assert.deepStrictEqual(file.extNames(), [
        '.js', '.json', '.json5', '.hjson', '.yaml', '.yml',
        '.coffee', '.cson', '.properties', '.toml'
      ])
    })
  })

  describe('failures', function () {
    let f // eslint-disable-line
    it('try loading a not existing file', function () {
      assert.throws(function () {
        f = new File(confDir + 'notexists.json')
      })
    })
    it('try loading a file with unsupported extension', function () {
      assert.throws(function () {
        f = new File(confDir + 'default.txt')
      })
    })
    it('try loading a bad cson file', function () {
      assert.throws(function () {
        f = new File(confDir + 'bad.cson')
      })
    })
    it('try loading a bad json file', function () {
      assert.throws(function () {
        f = new File(confDir + 'bad.json')
      })
    })
  })

  describe('load', function () {
    it('coffee file', function () {
      const file = new File(confDir + 'default.coffee')
      assertObj(file)
    })
    it('cson file', function () {
      const file = new File(confDir + 'default.cson')
      assertObj(file)
    })
    it('js file', function () {
      const file = new File(confDir + 'default.js')
      assertObj(file)
    })
    it('json file', function () {
      const file = new File(confDir + 'default.json')
      assertObj(file)
    })
    it('json5 file', function () {
      const file = new File(confDir + 'default.json5')
      assertObj(file)
    })
    it('hjson file', function () {
      const file = new File(confDir + 'default.hjson')
      assertObj(file)
    })
    it('properties file', function () {
      const file = new File(confDir + 'default.properties')
      // make corrections - properties does not allow mixed arrays
      file.obj.config.array[1] = String(file.obj.config.array[1])
      assertObj(file)
    })
    it('toml file', function () {
      const file = new File(confDir + 'default.toml')
      // make corrections - toml does not allow mixed arrays
      file.obj.config.array[1] = String(file.obj.config.array[1])
      assertObj(file)
    })
    it('yaml file', function () {
      const file = new File(confDir + 'default.yaml')
      assertObj(file)
    })
    it('yml file', function () {
      const file = new File(confDir + 'default.yml')
      assertObj(file)
    })
  })
})
