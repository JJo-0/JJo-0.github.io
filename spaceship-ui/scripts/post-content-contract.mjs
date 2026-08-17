import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const postsDir = path.join(root, 'site', 'content', 'posts');
const publicDir = path.join(root, 'site', 'assets');
const retiredImageDir = path.join(publicDir, 'image');
const postAssetsDir = path.join(publicDir, 'assets', 'posts');
const postComponentsDir = path.join(root, 'src', 'components', 'post');
const issues = [];

const NONCANONICAL_FENCE_IDS = new Map([
  ['C', 'c'],
  ['C++', 'cpp'],
  ['c++', 'cpp'],
  ['pseudocode', 'text'],
]);
const CHART_RUNTIME_PATTERN = /\b(?:new\s+Chart\s*\(|Chart\.getChart\s*\()/;

function filesUnder(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(full, predicate));
    else if (predicate(full)) out.push(full);
  }
  return out;
}

function stripFencedCode(source) {
  const lines = source.split(/\r?\n/);
  const kept = [];
  let fenceChar = null;
  let fenceLength = 0;

  for (const line of lines) {
    const match = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (match) {
      const char = match[1][0];
      const length = match[1].length;
      if (fenceChar === null) {
        fenceChar = char;
        fenceLength = length;
      } else if (char === fenceChar && length >= fenceLength) {
        fenceChar = null;
        fenceLength = 0;
      }
      kept.push('');
      continue;
    }

    kept.push(fenceChar === null ? line : '');
  }

  return kept.join('\n');
}

function getFrontmatter(source) {
  return source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? '';
}

function normalizePublicReference(reference) {
  const withoutQuery = reference.split(/[?#]/, 1)[0];
  try {
    return decodeURIComponent(withoutQuery);
  } catch {
    return withoutQuery;
  }
}

function assertPublicAssetExists(reference, sourceFile) {
  const normalized = normalizePublicReference(reference);
  const relative = normalized.replace(/^\/+/, '');
  const full = path.resolve(publicDir, relative);
  const publicRoot = `${path.resolve(publicDir)}${path.sep}`;

  if (!full.startsWith(publicRoot)) {
    issues.push(`${sourceFile}: asset path escapes publicDir: ${reference}`);
    return;
  }
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
    issues.push(`${sourceFile}: referenced post asset does not exist: ${reference}`);
  }
}

const postFiles = filesUnder(
  postsDir,
  (file) => /\.mdx?$/.test(file) && !path.basename(file).startsWith('_'),
);

for (const file of postFiles) {
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  const raw = fs.readFileSync(file, 'utf8');
  const source = stripFencedCode(raw);
  const frontmatter = getFrontmatter(raw);
  const isMdx = file.endsWith('.mdx');

  if (!isMdx && /^\s*import\s.+\sfrom\s+['"][^'"]+['"];?\s*$/m.test(source)) {
    issues.push(`${relative}: component/module imports require .mdx`);
  }

  if (isMdx) {
    if (/<script\b/i.test(source)) {
      issues.push(
        `${relative}: direct <script> is not allowed in post MDX; encapsulate behavior in a post component`,
      );
    }
    if (/<style\b/i.test(source)) {
      issues.push(
        `${relative}: direct <style> is not allowed in post MDX; component styles belong in the component`,
      );
    }

    for (const match of source.matchAll(/from\s+['"](@\/components\/[^'"]+)['"]/g)) {
      const specifier = match[1];
      if (!specifier.startsWith('@/components/post/')) {
        issues.push(`${relative}: post MDX component import must use @/components/post/: ${specifier}`);
        continue;
      }

      const componentPath = path.resolve(root, 'src', specifier.slice('@/'.length));
      if (!componentPath.startsWith(`${path.resolve(postComponentsDir)}${path.sep}`)) {
        issues.push(`${relative}: component import escapes post component namespace: ${specifier}`);
      } else if (!fs.existsSync(componentPath)) {
        issues.push(`${relative}: imported post component does not exist: ${specifier}`);
      } else if (!/\.(?:astro|svelte)$/.test(componentPath)) {
        issues.push(`${relative}: post components must be .astro or .svelte: ${specifier}`);
      }
    }
  }

  for (const match of source.matchAll(/\/assets\/posts\/[^\s)"'<>{]+/g)) {
    const reference = match[0].replace(/[.,;:]$/, '');
    assertPublicAssetExists(reference, relative);
  }

  if (/\/image\//.test(source)) {
    issues.push(
      `${relative}: /image is retired; move repository-owned media to /assets/posts/<namespace>/`,
    );
  }

  const hasChartRuntime = CHART_RUNTIME_PATTERN.test(source);
  const chartOptIn = /^usesChart:\s*true\s*$/m.test(frontmatter);
  if (hasChartRuntime && !chartOptIn) {
    issues.push(`${relative}: Chart runtime detected; declare \`usesChart: true\` in frontmatter`);
  }
  if (!hasChartRuntime && chartOptIn) {
    issues.push(`${relative}: \`usesChart: true\` is stale; no Chart runtime call was detected`);
  }
  if (hasChartRuntime && chartOptIn && !source.includes('astro:page-load')) {
    issues.push(
      `${relative}: chart-enabled post must initialize through \`astro:page-load\` for ClientRouter navigation`,
    );
  }

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^```([^\s`]*)\s*$/);
    if (!match) continue;
    const replacement = NONCANONICAL_FENCE_IDS.get(match[1]);
    if (replacement) {
      issues.push(
        `${relative}: use canonical Shiki language id \`${replacement}\`, not \`${match[1]}\``,
      );
    }
  }
}

// /image was fully retired after the final legacy-media migration. Reintroducing the
// directory is a regression rather than a new allowlist entry.
if (fs.existsSync(retiredImageDir)) {
  issues.push('site/assets/image: retired legacy directory must not be reintroduced');
}

// Catch /image references outside post Markdown too (for example homepage components).
for (const sourceRoot of [path.join(root, 'site', 'content'), path.join(root, 'src')]) {
  for (const file of filesUnder(sourceRoot, (candidate) =>
    /\.(?:md|mdx|astro|svelte|ts|js|mjs|css|json)$/.test(candidate),
  )) {
    const relative = path.relative(root, file).replaceAll(path.sep, '/');
    const source = stripFencedCode(fs.readFileSync(file, 'utf8'));
    if (/\/image\//.test(source)) {
      issues.push(`${relative}: /image is retired and must not be referenced`);
    }
  }
}

if (!fs.existsSync(path.join(postComponentsDir, 'Math.astro'))) {
  issues.push('src/components/post/Math.astro: canonical post Math component is missing');
}
if (fs.existsSync(path.join(root, 'src', 'components', 'Math.astro'))) {
  issues.push('src/components/Math.astro: legacy component location must not be reintroduced');
}

if (fs.existsSync(postAssetsDir)) {
  for (const file of filesUnder(postAssetsDir)) {
    const relative = path.relative(postAssetsDir, file).replaceAll(path.sep, '/');
    const segments = relative.split('/');
    const fileName = segments.pop();
    for (const segment of segments) {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(segment)) {
        issues.push(
          `site/assets/assets/posts/${relative}: post asset directories must use lowercase kebab-case`,
        );
      }
    }
    if (!/^[a-z0-9][a-z0-9.-]*$/.test(fileName ?? '')) {
      issues.push(
        `site/assets/assets/posts/${relative}: post asset filenames must use lowercase kebab-case/dots`,
      );
    }
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`post-content-contract: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `post-content-contract: PASS (${postFiles.length} posts, canonical post components/assets/fence ids/chart opt-ins/lifecycle, /image retired)`,
);