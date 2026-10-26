import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';

// Exercise the actual TypeScript module, not a second implementation of its lifecycle.
const require = createRequire(import.meta.url);
const ts = require('typescript');
const sourcePath = process.env.JJO_ASCII_TEST_SOURCE || fileURLToPath(
  new URL('../src/lib/experience/ascii-art.ts', import.meta.url)
);
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  fileName: sourcePath,
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  reportDiagnostics: true,
});
assert.deepEqual(
  (compiled.diagnostics || []).filter((item) => item.category === ts.DiagnosticCategory.Error),
  [],
  'ASCII runtime must transpile without syntax errors'
);

function host() {
  return { canvas: {}, querySelector() { return this.canvas; } };
}

function fixture(readyState = 'complete', hosts = [host()]) {
  const listeners = new Map();
  const installed = [];
  const disposed = [];
  const document = {
    readyState,
    hosts,
    querySelectorAll() { return this.hosts; },
    addEventListener(type, callback, options) {
      const entries = listeners.get(type) || [];
      if (!entries.some((entry) => entry.callback === callback)) {
        entries.push({ callback, once: !!options?.once });
        listeners.set(type, entries);
      }
    },
    removeEventListener(type, callback) {
      listeners.set(type, (listeners.get(type) || []).filter((entry) => entry.callback !== callback));
    },
    dispatch(type) {
      for (const entry of [...(listeners.get(type) || [])]) {
        if (!(listeners.get(type) || []).includes(entry)) continue;
        if (entry.once) this.removeEventListener(type, entry.callback);
        entry.callback();
      }
    },
  };
  const context = vm.createContext({ exports: {}, window: {}, document });
  vm.runInContext(compiled.outputText, context, { filename: sourcePath });
  context.testInstall = (element, canvas) => {
    const record = { element, canvas };
    installed.push(record);
    return () => disposed.push(record);
  };
  vm.runInContext('installCanvas = globalThis.testInstall;', context);
  const install = context.exports.installAsciiArtRuntime;
  return { context, document, listeners, installed, disposed, install };
}

test('SSR installation is a no-op', () => {
  const context = vm.createContext({ exports: {} });
  vm.runInContext(compiled.outputText, context);
  assert.doesNotThrow(() => context.exports.installAsciiArtRuntime());
});

test('repeated installer calls preserve the singleton', () => {
  const f = fixture();
  f.install();
  f.install();
  assert.equal(f.installed.length, 1);
  assert.equal(f.disposed.length, 0);
});

test('ready document followed by astro:page-load initializes each canvas once', () => {
  const f = fixture();
  f.install();
  f.document.dispatch('astro:page-load');
  f.document.dispatch('astro:page-load');
  assert.equal(f.installed.length, 1);
  assert.equal(f.disposed.length, 0);
});

for (const events of [
  ['DOMContentLoaded', 'astro:page-load'],
  ['astro:page-load', 'DOMContentLoaded'],
]) {
  test(`initial event order ${events.join(' -> ')} does not rebuild the graph`, () => {
    const f = fixture('loading');
    f.install();
    assert.equal(f.installed.length, 0);
    events.forEach((event) => f.document.dispatch(event));
    assert.equal(f.installed.length, 1);
    assert.equal(f.disposed.length, 0);
  });
}

test('new hosts initialize without restarting unchanged canvases', () => {
  const f = fixture();
  f.install();
  f.document.hosts.push(host());
  f.document.dispatch('astro:page-load');
  assert.equal(f.installed.length, 2);
  assert.equal(f.disposed.length, 0);
});

test('removed hosts are disposed exactly once', () => {
  const f = fixture();
  f.install();
  f.document.hosts = [];
  f.document.dispatch('astro:page-load');
  f.document.dispatch('astro:page-load');
  assert.equal(f.disposed.length, 1);
});

test('replacement canvas in the same host disposes the old instance', () => {
  const f = fixture();
  f.install();
  f.document.hosts[0].canvas = {};
  f.document.dispatch('astro:page-load');
  assert.equal(f.installed.length, 2);
  assert.equal(f.disposed.length, 1);
  assert.equal(f.disposed[0], f.installed[0]);
});

test('a removed canvas is cleaned up and a later canvas can initialize', () => {
  const f = fixture();
  f.install();
  f.document.hosts[0].canvas = null;
  f.document.dispatch('astro:page-load');
  assert.equal(f.disposed.length, 1);
  f.document.hosts[0].canvas = {};
  f.document.dispatch('astro:page-load');
  assert.equal(f.installed.length, 2);
});

test('Astro swap disposes the old page and initializes the next page once', () => {
  const f = fixture();
  f.install();
  f.document.dispatch('astro:before-swap');
  f.document.hosts = [host()];
  f.document.dispatch('astro:page-load');
  f.document.dispatch('astro:page-load');
  assert.equal(f.installed.length, 2);
  assert.equal(f.disposed.length, 1);
});

test('destroy before DOMContentLoaded cannot resurrect a detached runtime', () => {
  const f = fixture('loading');
  f.install();
  f.context.window.__jjoAsciiRuntime.destroy();
  f.document.dispatch('DOMContentLoaded');
  f.document.dispatch('astro:page-load');
  assert.equal(f.installed.length, 0);
  assert.equal(f.context.window.__jjoAsciiRuntime, undefined);
  for (const entries of f.listeners.values()) assert.equal(entries.length, 0);
});

test('destroy is idempotent and an old destroy cannot remove a new singleton', () => {
  const f = fixture();
  f.install();
  const oldRuntime = f.context.window.__jjoAsciiRuntime;
  oldRuntime.destroy();
  f.install();
  const newRuntime = f.context.window.__jjoAsciiRuntime;
  oldRuntime.destroy();
  assert.equal(f.context.window.__jjoAsciiRuntime, newRuntime);
  assert.equal(f.disposed.length, 1);
});

test('fallback geometry is not allocated when the module is imported', () => {
  const f = fixture();
  assert.equal(vm.runInContext('artifact === undefined', f.context), true);
  const points = vm.runInContext('buildArtifact()', f.context);
  assert.equal(points.length, 6 * 15 * 15);
});

test('adjacency preserves order, repeated edges, self-loops, and edge identity', () => {
  const f = fixture();
  const edges = [
    { source: 'a', target: 'b' },
    { source: 'a', target: 'c' },
    { source: 'a', target: 'a' },
    { source: 'a', target: 'b' },
  ];
  const expected = new Map();
  for (const edge of edges) {
    expected.set(edge.source, [...(expected.get(edge.source) || []), edge]);
    expected.set(edge.target, [...(expected.get(edge.target) || []), edge]);
  }
  const build = vm.runInContext('buildAdjacency', f.context);
  const actual = build(edges);
  assert.deepEqual([...actual.keys()], [...expected.keys()]);
  for (const [id, list] of expected) {
    assert.equal(actual.get(id).length, list.length);
    list.forEach((edge, index) => assert.equal(actual.get(id)[index], edge));
  }
  assert.equal(build([]).size, 0);
});
