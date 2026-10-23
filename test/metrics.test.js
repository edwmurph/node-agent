const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const path = require('node:path');
const { test } = require('node:test');

// Run inside an isolated container, without publishing any host ports.
test('real entrypoint preserves startup, metrics, routing and NODE_NAME', async () => {
  const child = spawn(process.execPath, ['--require', path.join(__dirname, 'thermal-fixture.js'), 'index.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, NODE_NAME: 'compatibility-fixture' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', data => { output += data; });
  child.stderr.on('data', data => { output += data; });
  try {
    let response;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null) throw new Error(output);
      try {
        response = await fetch('http://127.0.0.1:80/metrics');
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    assert.ok(response, output);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'node_temp_celcius 42.5');
    assert.match(response.headers.get('content-type'), /^text\/plain/);
    const trailing = await fetch('http://127.0.0.1:80/metrics/');
    assert.equal(trailing.status, 200);
    assert.equal(await trailing.text(), 'node_temp_celcius 42.5');
    assert.equal((await fetch('http://127.0.0.1:80/unknown')).status, 404);
    assert.match(output, /starting compatibility-fixture agent/);
    assert.match(output, /app listening on port 80/);
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill('SIGTERM');
      await exited;
    }
  }
});
