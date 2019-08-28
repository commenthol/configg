const pluginAsync = (opts, conf) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const { dirname, ...others } = opts
      resolve({ config: others })
    }, 50)
  })
}

module.exports = {
  config: {
    default: true
  },
  plugins: [
    [pluginAsync, { plugin: true }]
  ]
}
