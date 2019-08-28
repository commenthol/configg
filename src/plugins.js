const deasync = require('deasync')
const _merge = require('lodash.merge')

function plugins (conf, options = {}) {
  const { plugins } = conf

  function run (cb) {
    Promise.all(plugins.map(_plugin => {
      const [plugin, _opts] = (typeof _plugin === 'string')
        ? [_plugin]
        : _plugin

      const opts = Object.assign(options, _opts)

      return (typeof plugin === 'function')
        ? plugin(opts, conf)
        : require(plugin)(opts, conf)
    }))
      .then(results => {
        results.forEach(result => _merge(conf, result))
        cb()
      })
      .catch(cb)
  }

  if (Array.isArray(plugins) && plugins.length) {
    deasync(run)()
  }

  return conf
}

module.exports = plugins
