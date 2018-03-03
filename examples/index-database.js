/* ./index-database.js */
var config = require('configg')()

var database = require('my-database') // eslint-disable-line

console.log('---- Application ----')
console.log(config.get('config.backend'))
