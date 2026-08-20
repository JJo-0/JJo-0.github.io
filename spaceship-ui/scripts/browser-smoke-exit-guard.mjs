// Loaded only by Blog CI through NODE_OPTIONS. The harness intentionally owns
// browser/server child processes, so the final semantic marker is authoritative.
// This guard also gives rebased PR runs a deterministic upper bound.
const SUCCESS_MARKER = 'browser-smoke: PASS complete matrix';
const FAILURE_MARKER = 'browser-smoke: FAIL';
const MAX_RUNTIME_MS = Number(process.env.JJO_SMOKE_MAX_RUNTIME_MS || 240_000);

const originalLog = console.log.bind(console);
const originalError = console.error.bind(console);
let finishing = false;

function finish(code) {
  if (finishing) return;
  finishing = true;
  clearTimeout(deadline);
  setTimeout(() => process.exit(code), code === 0 ? 0 : 75);
}

console.log = (...args) => {
  originalLog(...args);
  if (args.map(String).join(' ').includes(SUCCESS_MARKER)) finish(0);
};

console.error = (...args) => {
  originalError(...args);
  if (args.map(String).join(' ').includes(FAILURE_MARKER)) finish(1);
};

const deadline = setTimeout(() => {
  originalError(`browser-smoke: FAIL — exceeded ${MAX_RUNTIME_MS} ms hard timeout`);
  finish(1);
}, MAX_RUNTIME_MS);
