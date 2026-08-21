import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const runtimePath = path.join(
  process.cwd(),
  'src',
  'lib',
  'experience',
  'renderer-runtime.ts',
);
const source = fs.readFileSync(runtimePath, 'utf8');

for (const marker of [
  'function replaceRendererCanvas(',
  'expectedCanvas?: HTMLCanvasElement',
  'canvas.parentElement !== host',
  'canvas.cloneNode(false)',
  "replacement.removeAttribute('width')",
  "replacement.removeAttribute('height')",
  'if (activeHost.isConnected) replaceRendererCanvas(activeHost)',
  'currentGeneration !== generation',
  '!canvas.isConnected',
  'replaceRendererCanvas(host, canvas)',
  'rendererError',
]) {
  assert.ok(source.includes(marker), `renderer-runtime.ts missing race boundary: ${marker}`);
}

assert.ok(
  source.indexOf('mountedRenderer?.destroy()') <
    source.indexOf('if (activeHost.isConnected) replaceRendererCanvas(activeHost)'),
  'renderer teardown must precede fresh-canvas replacement',
);
assert.ok(
  source.includes(
    'if (currentGeneration !== generation || !host.isConnected || !canvas.isConnected)',
  ),
  'stale async initialization must be rejected against generation, host, and canvas identity',
);
assert.equal(
  source.includes('const hadMountedRenderer = mountedRenderer !== null'),
  false,
  'canvas renewal must not depend only on a fully resolved renderer handle',
);

console.log(
  'renderer-reclassification-contract: PASS (fresh canvas per capability generation; stale async init isolation; diagnostic fallback)',
);
