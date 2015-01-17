/* ./index.js */
var config = require('configg')(__dirname);

console.log(config.get('config.backend'));
