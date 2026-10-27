import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { newsSourceFilename, newsSourceIdentity } from './news-media-source-file.mjs';

assert.equal(newsSourceFilename({
  slug: 'miopm-multi-immersion-light-sheet',
  sourceFile: '2026-10-20-miopm-multi-immersion-light-sheet-news.mdx',
}), '2026-10-20-miopm-multi-immersion-light-sheet-news.mdx');
assert.deepEqual(newsSourceIdentity({
  slug: 'miopm-multi-immersion-light-sheet',
  sourceFile: '2026-10-20-miopm-multi-immersion-light-sheet-news.mdx',
}, '---\nslug: miopm-multi-immersion-light-sheet\ndraft: false\n---\n'), {
  sourceFile: '2026-10-20-miopm-multi-immersion-light-sheet-news.mdx',
  effectiveSlug: 'miopm-multi-immersion-light-sheet',
});

assert.equal(newsSourceFilename({ slug: 'legacy-route' }), 'legacy-route.mdx');
assert.deepEqual(newsSourceIdentity({ slug: 'legacy-route' }, '---\ndraft: false\n---\n'), {
  sourceFile: 'legacy-route.mdx', effectiveSlug: 'legacy-route',
});
for (const sourceFile of ['../outside.mdx', 'folder/article.mdx', 'folder\\article.mdx', 'article.md']) {
  assert.throws(() => newsSourceFilename({ slug: 'safe-route', sourceFile }), /basename|\.mdx/);
}
assert.throws(() => newsSourceIdentity({
  slug: 'expected-route', sourceFile: '2026-10-20-article.mdx',
}, '---\nslug: different-route\ndraft: false\n---\n'), /does not match public slug/);

// Bind all current Oct 20 registry entries to their real source file and effective route.
const here = path.dirname(fileURLToPath(import.meta.url));
const media = JSON.parse(fs.readFileSync(path.join(here, '../site/news-media.json'), 'utf8'));
const postsDirectory = path.join(here, '../site/content/posts');
const oct20 = Object.entries(media).filter(([id]) => id.startsWith('oct20-'));
assert.equal(oct20.length, 8, 'Fixture covers all eight current Oct 20 media records');
const checkedPosts = new Map();
for (const [id, item] of oct20) {
  const filename = newsSourceFilename(item);
  const source = fs.readFileSync(path.join(postsDirectory, filename), 'utf8');
  assert.deepEqual(newsSourceIdentity(item, source), {
    sourceFile: filename,
    effectiveSlug: item.slug,
  }, `${id}: registered source file must resolve to its public route slug`);
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert(frontmatter, `${id}: source frontmatter must remain present`);
  assert.equal(
    [...frontmatter[1].matchAll(/^draft:\s*(true|false)\s*$/gm)].length,
    1,
    `${id}: exactly one explicit draft boolean must remain`
  );
  checkedPosts.set(item.slug, filename);
}
assert.equal(checkedPosts.size, 3, 'Eight media rows resolve to three source posts');
console.log('news-media-source-file: PASS custom/legacy resolution, invalid paths, slug matching, and 8 current registry records');
