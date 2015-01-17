/* ./index-database.js */
var config = require('configg')(__dirname, true);

var database = require('my-database');

console.log('---- Application ----')
console.log(config.get('config.backend'));
