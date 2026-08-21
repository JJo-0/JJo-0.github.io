import fs from 'node:fs';
import process from 'node:process';

const file = 'src/lib/experience/renderer-runtime.ts';
const source = fs.readFileSync(file, 'utf8');
const issues = [];

for (const marker of [
  'rendererRetryBaseUrl',
  'rendererRetryAttempt',
  'retryableRendererUrl',
  "new URL('.', import.meta.url)",
  'url.origin !== assetDirectory.origin',
  '!url.pathname.startsWith(assetDirectory.pathname)',
  "!url.pathname.endsWith('.js')",
  "retryUrl.searchParams.set('jjo-renderer-retry'",
  'import(/* @vite-ignore */ retryUrl.href)',
  'rendererModulePromise = null',
  'rendererRetryBaseUrl = retryUrl',
]) {
  if (!source.includes(marker)) issues.push(`missing ${marker}`);
}

if (source.includes('dataset.rendererError')) {
  issues.push('raw renderer exceptions must not be exposed through DOM data attributes');
}

if (!source.includes("return import('./renderer-core')")) {
  issues.push('primary renderer import path is missing');
}

if (issues.length) {
  console.error(`renderer-retry-contract: found ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  'renderer-retry-contract: PASS (same-origin asset validation, cache-busting retry URL, promise reset, no raw exception leakage)',
);
