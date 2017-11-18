/**
 * @copyright commenthol
 * @license MIT
 */

'use strict'

/* global describe, it, beforeEach */
/* eslint
   no-new: 0
*/

var fs = require('fs')
var _ = require('lodash')
var assert = require('assert')
var Config = require('../lib/config')
var hashtree = require('hashtree').hashTree
var path = require('path')

process.env.SUPPRESS_NO_CONFIG_WARNING = 1

function log (obj, other) { // eslint-disable-line
  console.log(JSON.stringify(obj, null, '\t'))
  if (other) {
    console.log(hashtree.diff(obj, other))
  }
}

/**
 * diff o1 with o2. Assert if o1 and o2 are not the same
 */
function deepEqual (o1, o2) {
  var res = hashtree.diff(o1, o2)
  assert.equal(typeof o1, 'object')
  assert.equal(typeof o2, 'object')
  assert.deepEqual(res.diff1, res.diff2)
  assert.deepEqual(res.diff1, {})
  assert.deepEqual(res.diff2, {})
}

describe('#config', function () {
  function clear () {
    // overwrite any possible env setings
    'NODE_ENV NODE_CONFIG NODE_CONFIG_DIR'.split(' ')
      .forEach(function (p) {
        delete (process.env[p])
      })
    process.env.HOSTNAME = 'server'
  }

  beforeEach(clear)

  describe('load configs', function () {
    it('module-a config', function () {
      var cconfig = new Config()
      var config = cconfig.dir(path.join(__dirname, 'fixtures/prj/node_modules/module-a'))
      var exp = {
        'config': {
          'module-a': 'origin',
          'override': 'module-a',
          'url': 'xtp://module-a'
        },
        'common': {
          'module': 'module-a',
          'type': 'default',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }
      deepEqual(config, exp)
    })

    it('module-b config', function () {
      var cconfig = new Config()
      var config = cconfig.dir(path.join(__dirname, 'fixtures/prj/node_modules/module-b'))
      var exp = {
        'config': {
          'module-b': 'origin',
          'override': 'module-b',
          'url': 'xtp://module-b'
        },
        'common': {
          'module': 'module-b',
          'type': 'default',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }
      deepEqual(config, exp)
    })

    it('module-c config', function () {
      var cconfig = new Config()
      var config = cconfig.dir(path.join(__dirname, 'fixtures/prj/node_modules/module-a/node_modules/module-c'))
      var exp = {
        'config': {
          'module-c': 'origin',
          'override': 'module-c',
          'url': 'xtp://module-c'
        },
        'common': {
          'module': 'module-c',
          'type': 'default',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }

      deepEqual(config, exp)
    })

    it('module-c config merged with module-a', function () {
      process.env.NODE_CONFIG_DIR = path.join(__dirname, 'fixtures/prj/node_modules/module-a/config')
      var cconfig = new Config()
      var configA = cconfig.dir(path.join(__dirname, 'fixtures/prj/node_modules/module-a'))
      var configAC = cconfig.dir(path.join(__dirname, 'fixtures/prj/node_modules/module-a/node_modules/module-c'))
      var expA = {
        'config': {
          'module-a': 'origin',
          'override': 'module-a',
          'url': 'xtp://module-a'
        },
        'common': {
          'module': 'module-a',
          'type': 'default',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }
      var expAC = {
        'config': {
          'module-c': 'origin',
          'override': 'module-a',
          'url': 'xtp://module-c',
          'module-a': 'origin'
        },
        'common': {
          'module': 'module-a',
          'type': 'default',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }

      deepEqual(configA, expA)
      deepEqual(configAC, expAC)
    })

    it('module-c config merged with module-b', function () {
      process.env.NODE_CONFIG_DIR = path.join(__dirname, 'fixtures/prj/node_modules/module-b/config')
      var cconfig = new Config()
      var configB = cconfig.dir(path.join(__dirname, 'fixtures/prj/node_modules/module-b'))
      var configBC = cconfig.dir(path.join(__dirname, 'fixtures/prj/node_modules/module-b/node_modules/module-c'))
      var expB = {
        'config': {
          'module-b': 'origin',
          'override': 'module-b',
          'url': 'xtp://module-b'
        },
        'common': {
          'module': 'module-b',
          'type': 'default',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }
      var expBC = {
        'config': {
          'module-c@0.1.2': 'origin',
          'override': 'module-b',
          'url': 'xtp://module-c',
          'v0.1.2': 'only',
          'module-b': 'origin'
        },
        'common': {
          'module': 'module-b',
          'type': 'default',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }

      deepEqual(configB, expB)
      deepEqual(configBC, expBC)
    })

    it('sample-prj config', function () {
      process.env.NODE_CONFIG_DIR = path.join(__dirname, '/fixtures/prj/config')
      var cconfig = new Config()
      var config = cconfig.dir(path.join(__dirname, '/fixtures/prj'))
      var configA = cconfig.dir(path.join(__dirname, '/fixtures/prj/node_modules/module-a'))
      var configB = cconfig.dir(path.join(__dirname, '/fixtures/prj/node_modules/module-b'))
      var configAC = cconfig.dir(path.join(__dirname, '/fixtures/prj/node_modules/module-a/node_modules/module-c'))
      var configBC = cconfig.dir(path.join(__dirname, '/fixtures/prj/node_modules/module-b/node_modules/module-c'))

      var exp = {
        'config': {
          'prj-default': 'origin',
          'override': 'prj-default'
        },
        'common': {
          'module': 'prj',
          'type': 'default',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }
      var expA = {
        'config': {
          'module-a': 'origin',
          'override': 'prj-default',
          'url': 'xtp://module-a',
          'prj-default': 'origin'
        },
        'common': {
          'module': 'prj',
          'type': 'default',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }
      var expB = {
        'config': {
          'module-b': 'origin',
          'override': 'prj-default',
          'url': 'xtp://module-b',
          'prj-default': 'origin'
        },
        'common': {
          'module': 'prj',
          'type': 'default',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }
      var expAC = {
        'config': {
          'module-c': 'origin',
          'override': 'prj-default',
          'url': 'xtp://module-c',
          'prj-default': 'origin'
        },
        'common': {
          'module': 'prj',
          'type': 'default',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }
      var expBC = {
        'config': {
          'module-c@0.1.2': 'origin',
          'override': 'prj-default',
          'url': 'xtp://module-c',
          'v0.1.2': 'only',
          'prj-default': 'v0.1.2 only'
        },
        'common': {
          'module': 'prj',
          'type': 'default',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }

      // ~ console.log(JSON.stringify(config, null, '\t'))
      deepEqual(config, exp)
      deepEqual(configA, expA)
      deepEqual(configB, expB)
      deepEqual(configAC, expAC)
      deepEqual(configBC, expBC)
    })

    it('with NODE_CONFIG_DIR', function () {
      process.env.NODE_CONFIG_DIR = path.join(__dirname, 'fixtures/prj/config')

      var cconfig = new Config()
      var exp = {
        'sample-prj': {
          'prj-default': 'origin',
          'override': 'prj-default'
        },
        'module-a': {
          'prj-default': 'origin',
          'override': 'prj-default'
        },
        'module-b': {
          'prj-default': 'origin',
          'override': 'prj-default'
        },
        'module-c': {
          'prj-default': 'origin',
          'override': 'prj-default'
        },
        'module-c@0.1.2': {
          'prj-default': 'v0.1.2 only',
          'override': 'prj-default'
        },
        'common': {
          'module': 'prj',
          'type': 'default'
        }
      }

      deepEqual(cconfig._entriesApp[1], exp)
    })

    it('module-a with NODE_CONFIG_DIR', function () {
      process.env.NODE_CONFIG_DIR = path.join(__dirname, 'fixtures/prj/config')

      var cconfig = new Config()
      var config = cconfig.dir(path.join(__dirname, 'fixtures/prj/node_modules/module-a'))
      var exp = {
        'config': {
          'module-a': 'origin',
          'override': 'prj-default',
          'url': 'xtp://module-a',
          'prj-default': 'origin'
        },
        'common': {
          'module': 'prj',
          'type': 'default',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }

      // ~ console.log(JSON.stringify(config, null, '\t'));
      deepEqual(config, exp)
    })

    it('module-a with NODE_CONFIG', function () {
      process.env.NODE_CONFIG = '{ "module-a": { "NODE_CONFIG": "origin" }, common: { "NODE_CONFIG": "origin" } }'
      var cconfig = new Config()
      var config = cconfig.dir(path.join(__dirname, 'fixtures/prj/node_modules/module-a'))
      var exp = {
        'config': {
          'module-a': 'origin',
          'override': 'module-a',
          'url': 'xtp://module-a',
          'NODE_CONFIG': 'origin'
        },
        'common': {
          'module': 'module-a',
          'type': 'default',
          'NODE_CONFIG': 'origin',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }

      // ~ console.log(JSON.stringify(config, null, '\t'));
      deepEqual(config, exp)
    })

    it('module-a with NODE_CONFIG which has a get property throws error', function () {
      var err

      process.env.NODE_CONFIG = '{ "module-a": { "NODE_CONFIG": "origin", get: "test" }, common: { "NODE_CONFIG": "origin" } }'

      try {
        var cconfig = new Config()
        cconfig.dir(path.join(__dirname, 'fixtures/prj/node_modules/module-a'))
      } catch (e) {
        err = e
      }
      assert.equal(err.message, 'get method already defined')
    })

    it('from empty directory', function () {
      var dirname = path.join(__dirname, 'fixtures/empty')
      try {
        fs.mkdirSync(dirname + '/config/')
      } catch (e) {}
      var cconfig = new Config()
      var config = cconfig.dir(dirname)
      var exp = {
        'config': {},
        'common': {
          'NODE_ENV': 'development',
          'NODE_APP_INSTANCE': undefined,
          'HOSTNAME': 'server'
        }
      }

      deepEqual(config, exp)
    })

    it('module-a config twice and test isolation', function () {
      var cconfig = new Config()
      var configA = cconfig.dir(path.join(__dirname, 'fixtures/prj/node_modules/module-a'))
      var configB = cconfig.dir(path.join(__dirname, 'fixtures/prj/node_modules/module-a'))
      var exp = {
        'config': {
          'module-a': 'origin',
          'override': 'module-a',
          'url': 'xtp://module-a'
        },
        'common': {
          'module': 'module-a',
          'type': 'default',
          'NODE_ENV': 'development',
          'HOSTNAME': 'server',
          'NODE_APP_INSTANCE': undefined
        }
      }
      // both configs are different objects
      assert.ok(configA !== configB)
      // but contain the same values
      deepEqual(configA, configB)
      // configs are isolated
      delete configA.config
      deepEqual(configB, exp)
    })
  })

  describe('load files', function () {
    describe('for myapp', function () {
      clear()
      process.env.NODE_CONFIG_DIR = path.join(__dirname, 'fixtures/myapp/config')
      var cconfig = new Config()
      var config = cconfig.dir(path.join(__dirname, 'fixtures/myapp'))
      var exp = {
        'config': {
          'database': {
            'host': 'dbhost',
            'name': 'dbtest',
            'port': 1529
          },
          'array': [
            1,
            '2',
            3.01
          ],
          'local': 1
        },
        'common': {
          'value': 'test',
          'local': 3,
          'NODE_ENV': 'development',
          'NODE_APP_INSTANCE': undefined,
          'HOSTNAME': 'server'
        }
      }
      it('loads config', function () {
        deepEqual(config, exp)
      })
      it('gets config value', function () {
        assert.deepEqual(config.get('config.database.host'), exp.config.database.host)
      })
      it('gets config value from config', function () {
        assert.deepEqual(config.config.get(['database', 'host']), exp.config.database.host)
      })
      it('gets config value from common', function () {
        assert.deepEqual(config.common.get('value'), exp.common.value)
      })
      it('undefined config value', function () {
        assert.deepEqual(config.get('config.notExists'), undefined)
      })
      it('undefined key returns config', function () {
        assert.deepEqual(config.get(), exp)
      })
    })

    it('for myapp in production', function () {
      process.env.NODE_ENV = 'production'
      process.env.NODE_CONFIG_DIR = path.join(__dirname, 'fixtures/myapp/config')

      var cconfig = new Config()
      var config = cconfig.dir(path.join(__dirname, 'fixtures/myapp'))
      var exp = {
        'config': {
          'database': {
            'host': 'dbhost-prod',
            'name': 'dbprod',
            'port': 1529
          },
          'array': [
            1,
            '2',
            3.01
          ],
          'local': 1
        },
        'common': {
          'value': 'production',
          'production': 'filename',
          'local': 3,
          'NODE_ENV': 'production',
          'HOSTNAME': 'server'
        }
      }
      // ~ console.log(JSON.stringify(config,null,'\t'))
      deepEqual(config, exp)
    })

    it('for myapp on host myserver', function () {
      process.env.HOSTNAME = 'myserver'
      process.env.NODE_CONFIG_DIR = path.join(__dirname, 'fixtures/myapp/config')

      var cconfig = new Config()
      var config = cconfig.dir(path.join(__dirname, 'fixtures/myapp'))
      var exp = {
        'config': {
          'database': {
            'host': 'dbhost-myserver',
            'name': 'dbmyserver',
            'port': 1529
          },
          'array': [
            1,
            '2',
            3.01
          ],
          'local': 1
        },
        'common': {
          'value': 'test',
          'local': 3,
          'NODE_ENV': 'development',
          'HOSTNAME': 'myserver'
        }
      }

      // ~ console.log(JSON.stringify(config,null,'\t'))
      deepEqual(config, exp)
    })

    it('for myapp in production on host myserver', function () {
      process.env.NODE_ENV = 'production'
      process.env.HOSTNAME = 'myserver'
      process.env.NODE_CONFIG_DIR = path.join(__dirname, 'fixtures/myapp/config')

      var cconfig = new Config()
      var config = cconfig.dir(path.join(__dirname, 'fixtures/myapp'))
      var exp = {
        'config': {
          'database': {
            'host': 'dbhost-myserver-prod',
            'name': 'dbmyserverprod',
            'port': 1529
          },
          'array': [
            1,
            '2',
            3.01
          ],
          'local': 1
        },
        'common': {
          'value': 'production',
          'production': 'filename',
          'local': 3,
          'NODE_ENV': 'production',
          'HOSTNAME': 'myserver'
        }
      }

      // ~ console.log(JSON.stringify(config,null,'\t'))
      deepEqual(config, exp)
    })

    it('for module test', function () {
      var cconfig = new Config()
      var config = cconfig.dir(path.join(__dirname, 'fixtures/test'))
      var exp = {
        'config': {
          'url': 'http://default/',
          'local': 2
        },
        'common': {
          'value': 'test',
          'local': 3,
          'NODE_ENV': 'development',
          'HOSTNAME': 'server'
        }
      }

      deepEqual(config, exp)
    })

    it('for module test in app context of myapp', function () {
      process.env.NODE_CONFIG_DIR = path.join(__dirname, 'fixtures/myapp/config')
      var cconfig = new Config()
      // first "require" from myapp
      cconfig.dir(path.join(__dirname, 'fixtures/myapp'))
      // second "require" from module "test"
      var config = cconfig.dir(path.join(__dirname, 'fixtures/test'))
      var exp = {
        'config': {
          'url': 'http://foo.bar/',
          'local': 2,
          'cors': false
        },
        'common': {
          'value': 'test',
          'local': 3,
          'NODE_ENV': 'development',
          'HOSTNAME': 'server'
        }
      }

      deepEqual(config, exp)
    })
  })

  describe('strict mode', function () {
    it('good case', function () {
      var dir = path.join(__dirname, 'fixtures/strictmode')
      _.merge(process.env, {
        NODE_CONFIG_STRICT_MODE: 'Y',
        NODE_CONFIG_DIR: dir + '/configdir',
        NODE_ENV: 'production'
      })
      var cconfig = new Config()
      var config = cconfig.dir(dir)
      var exp = {
        config: {
          config: true,
          './config': true,
          './configdir': true,
          'default': true,
          production: true
        },
        common: {
          NODE_ENV: 'production',
          NODE_APP_INSTANCE: undefined,
          HOSTNAME: 'server'
        }
      }
      assert.deepEqual(config, exp)
    })
    it('failure NODE_ENV=test', function () {
      var err
      var dir = path.join(__dirname, 'fixtures/strictmode')
      _.merge(process.env, {
        NODE_CONFIG_STRICT_MODE: 'Y',
        NODE_CONFIG_DIR: dir + '/configdir',
        NODE_ENV: 'test'
      })
      try {
        new Config()
      } catch (e) {
        err = e
      }
      assert.equal(err.message, 'strict mode failed!')
    })
    it('good case NODE_APP_INSTANCE', function () {
      var dir = path.join(__dirname, 'fixtures/strictmode')
      _.merge(process.env, {
        NODE_CONFIG_STRICT_MODE: 'Y',
        NODE_APP_INSTANCE: 2,
        NODE_CONFIG_DIR: dir + '/configdir',
        NODE_ENV: 'production'
      })
      var cconfig = new Config()
      var config = cconfig.dir(dir)
      var exp = {
        'config': {
          'config': true,
          './config': true,
          './configdir': true,
          'default': true,
          'production': true,
          'instance': 2
        },
        'common': {
          'NODE_ENV': 'production',
          'NODE_APP_INSTANCE': '2',
          'HOSTNAME': 'server'
        }
      }
      assert.deepEqual(config, exp)
    })
    it('failure NODE_APP_INSTANCE', function () {
      var err
      var dir = path.join(__dirname, 'fixtures/strictmode')
      _.merge(process.env, {
        NODE_CONFIG_STRICT_MODE: 'Y',
        NODE_APP_INSTANCE: 1,
        NODE_CONFIG_DIR: dir + '/configdir',
        NODE_ENV: 'production'
      })
      try {
        new Config()
      } catch (e) {
        err = e
      }
      assert.equal(err.message, 'strict mode failed!')
    })
  })
})
