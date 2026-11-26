import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const harnessUrl = new URL('./browser-smoke-harness.mjs', import.meta.url).href;

function runFixture(t, chromeSource, exercise, { debugPort } = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'jjo-chrome-fixture-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const executable = path.join(directory, 'chrome-fixture');
  if (chromeSource) {
    fs.writeFileSync(executable, `#!/usr/bin/env node\n${chromeSource}`, { mode: 0o700 });
  }
  const env = { ...process.env, TMPDIR: directory, CHROME_PATH: executable };
  if (debugPort === undefined) delete env.JJO_SMOKE_DEBUG_PORT;
  else env.JJO_SMOKE_DEBUG_PORT = debugPort;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import fs from 'node:fs';
    import { startChrome, stopChild, removeProfile } from ${JSON.stringify(harnessUrl)};
    ${exercise}
  `], {
    env,
    encoding: 'utf8',
    timeout: 10_000,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(fs.readdirSync(directory).filter((name) => name.startsWith('jjo-smoke-')), []);
}

test('Chrome launcher waits for its own DevTools address and uses port zero by default', (t) => {
  runFixture(t, `
    if (!process.argv.includes('--remote-debugging-port=0')) process.exit(7);
    if (!process.argv.includes('--remote-debugging-address=127.0.0.1')) process.exit(8);
    process.stderr.write('DevTools listening on ws://127.0.0.1:');
    setTimeout(() => process.stderr.write('49321/devtools/browser/fixture-owned\\n'), 50);
    setInterval(() => {}, 1_000);
  `, `
    const chrome = await startChrome();
    try {
      assert.equal(chrome.url, 'ws://127.0.0.1:49321/devtools/browser/fixture-owned');
      assert.ok(fs.existsSync(chrome.profile));
    } finally {
      await stopChild(chrome.child);
      removeProfile(chrome.profile);
    }
  `);
});

test('early Chrome exit reports the exit code and stderr and removes its profile', (t) => {
  runFixture(t, `
    process.stderr.write('fixture: ' + process.argv.find((arg) => arg.startsWith('--remote-debugging-port=')));
    process.exitCode = 17;
  `, `
    await assert.rejects(startChrome(), (error) => {
      assert.match(error.message, /exited before startup \\(17\\)/);
      assert.match(error.message, /fixture: --remote-debugging-port=9444/);
      return true;
    });
  `, { debugPort: '9444' });
});

test('missing Chrome executable reports a spawn error and removes its profile', (t) => {
  runFixture(t, null, `await assert.rejects(startChrome(), /ENOENT/);`);
});
