const util = require('util');
const proc = require('child_process');

module.exports = util.promisify( proc.exec );
