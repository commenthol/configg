const _merge = require('lodash.merge')

function plugins (conf, options = {}) {
  const { plugins } = conf

  if (Array.isArray(plugins) && plugins.length) {
    const results = plugins.map(_plugin => {
      const [plugin, _opts] = (typeof _plugin === 'string')
        ? [_plugin]
        : _plugin

      const opts = Object.assign(options, _opts)

      return (typeof plugin === 'function')
        ? plugin(opts, conf)
        : require(plugin)(opts, conf)
    })

    const needDeasync = results.some(result => typeof result.then === 'function')

    const run = (cb) => {
      Promise.all(results)
        .then(results => {
          results.forEach(result => _merge(conf, result))
          cb()
        })
        .catch(cb)
    }

    const runSync = () => {
      results.map(result => _merge(conf, result))
    }

    let deasync
    try {
      deasync = require('deasync')
    } catch (e) {
      if (needDeasync) throw new Error('async plugin detected; npm install deasync')
      runSync()
    }
    if (deasync) deasync(run)() // run asynchronously
  }

  return conf
}

module.exports = plugins
