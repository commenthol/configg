'use strict'

const config = require('configg')(__dirname)

const moduleA = require('module-a')
const moduleB = require('module-b')

const M = function () {
  return {
    prj: config,
    a: moduleA(),
    b: moduleB()
  }
}

module.exports = M

if (module === require.main) {
  console.log(JSON.stringify(M(), null, 2))
}
