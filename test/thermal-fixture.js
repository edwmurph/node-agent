const assert = require('node:assert/strict');
const execPath = require.resolve('../lib/util/exec');
require.cache[execPath] = {
  id: execPath,
  filename: execPath,
  loaded: true,
  exports: async command => {
    assert.equal(command, 'cat /sys/class/thermal/thermal_zone0/temp');
    return { stdout: '42500\n', stderr: '' };
  }
};
