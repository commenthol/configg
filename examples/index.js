/* ./index.js */
var config = require('configg')(__dirname, true);

console.log(config.get('config.backend'));
