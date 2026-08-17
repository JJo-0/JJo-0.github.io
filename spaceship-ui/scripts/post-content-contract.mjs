import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const postsDir = path.join(root, 'site', 'content', 'posts');
const publicDir = path.join(root, 'site', 'assets');
const legacyImageDir = path.join(publicDir, 'image');
const postAssetsDir = path.join(publicDir, 'assets', 'posts');
const postComponentsDir = path.join(root, 'src', 'components', 'post');
const issues = [];

// Existing pre-contract files may remain until their owning posts are migrated.
// This is a freeze list, not a target directory: additions under /image are forbidden.
const LEGACY_IMAGE_ALLOWLIST = new Set([
  'AMR_.png',
  'AMR_Sample_V1.mp4',
  'AMR_Sample_V2.mp4',
  'HPE_general_pipline.png',
  'circle_face.JPG',
  'graph_example_1.png',
  'mouse_surprised.gif',
  'raspberrypi_info.jpeg',
  'raspberrypi_setting.jpeg',
  '증명사진.jpeg',
]);

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
  const isMdx = file.endsWith('.mdx');

  if (!isMdx && /^\s*import\s.+\sfrom\s+['"][^'"]+['"];?\s*$/m.test(source)) {
    issues.push(`${relative}: component/module imports require .mdx`);
  }

  if (isMdx) {
    if (/<script\b/i.test(source)) {
      issues.push(`${relative}: direct <script> is not allowed in post MDX; encapsulate behavior in a post component`);
    }
    if (/<style\b/i.test(source)) {
      issues.push(`${relative}: direct <style> is not allowed in post MDX; component styles belong in the component`);
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

  for (const match of source.matchAll(/\/(?:assets\/posts|image)\/[^\s)"'<>{]+/g)) {
    const reference = match[0].replace(/[.,;:]$/, '');
    if (reference.startsWith('/assets/posts/')) {
      assertPublicAssetExists(reference, relative);
      continue;
    }

    const legacyName = normalizePublicReference(reference).slice('/image/'.length);
    if (!LEGACY_IMAGE_ALLOWLIST.has(legacyName)) {
      issues.push(`${relative}: /image is frozen legacy storage; move new assets to /assets/posts/<namespace>/: ${reference}`);
    }
  }

  if (/^```C\s*$/m.test(raw)) {
    issues.push(`${relative}: use canonical Shiki language id \`c\`, not \`C\``);
  }
  if (/^```pseudocode\s*$/m.test(raw)) {
    issues.push(`${relative}: use \`text\` for pseudocode unless a registered Shiki language is added`);
  }
}

const actualLegacyImages = filesUnder(legacyImageDir).map((file) =>
  path.relative(legacyImageDir, file).replaceAll(path.sep, '/'),
);
for (const legacyName of actualLegacyImages) {
  if (!LEGACY_IMAGE_ALLOWLIST.has(legacyName)) {
    issues.push(`site/assets/image/${legacyName}: new files are forbidden in the frozen legacy image directory`);
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
        issues.push(`site/assets/assets/posts/${relative}: post asset directories must use lowercase kebab-case`);
      }
    }
    if (!/^[a-z0-9][a-z0-9.-]*$/.test(fileName ?? '')) {
      issues.push(`site/assets/assets/posts/${relative}: post asset filenames must use lowercase kebab-case/dots`);
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
  `post-content-contract: PASS (${postFiles.length} posts, ${actualLegacyImages.length} grandfathered /image assets, canonical post components/assets)`,
);
