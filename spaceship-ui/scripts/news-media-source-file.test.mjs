import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { newsSourceFilename, newsSourceIdentity, newsBodyMediaIds } from './news-media-source-file.mjs';
import { filterBodyRegisteredMedia } from './browser-news-media-audit.mjs';

const bodyFixture = { slug: 'reviewed-post', mediaIds: ['cover', 'plate'], bodyMediaIds: ['plate'] };
const bodySource = '---\nslug: reviewed-post\n---\n<NewsFigure media="plate" />';
assert.deepEqual(newsBodyMediaIds(bodyFixture, bodySource), ['plate']);
assert.deepEqual(newsBodyMediaIds({ slug: 'legacy', mediaIds: ['cover'] }, ''), ['cover']);
for (const bodyMediaIds of [[], ['plate', 'plate'], ['unknown'], ['cover']])
  assert.throws(() => newsBodyMediaIds({ ...bodyFixture, bodyMediaIds }, bodySource));
assert.throws(() => newsBodyMediaIds(bodyFixture, bodySource + '\n<NewsFigure media="cover" />'));
assert.throws(() => newsBodyMediaIds({ ...bodyFixture, mediaIds: ['cover', 'plate', 'extra'] }, bodySource));

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
const sep29Edition = JSON.parse(fs.readFileSync(path.join(here, '../site/news-edition-20260929.json'), 'utf8'));
const sep29Agent = sep29Edition.entries.find((row) => row.slug === '2026-09-29-agent-thermostable-mrna-vaccine-news');
const sep29Source = fs.readFileSync(path.join(postsDirectory, `${sep29Agent.slug}.mdx`), 'utf8');
const sep29BodyMediaIds = newsBodyMediaIds(sep29Agent, sep29Source);
const sep29RegisteredMedia = sep29Agent.mediaIds.map((id) => [id, media[id]]);
const sep29BodyRegisteredMedia = filterBodyRegisteredMedia(sep29RegisteredMedia, new Set(sep29BodyMediaIds));
assert.deepEqual(sep29BodyRegisteredMedia.map(([id]) => id), sep29BodyMediaIds,
  'Article-body assertions must use the exact approved body figure IDs');
assert(!sep29BodyRegisteredMedia.some(([id]) => id === 'sep29-agent-fig1'),
  'Listing thumbnail Figure 1 is not a body figure');
assert.deepEqual(filterBodyRegisteredMedia([['legacy-cover', {}], ['legacy-body', {}]], null),
  [['legacy-cover', {}], ['legacy-body', {}]], 'Undeclared legacy body inventories retain prior behavior');
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
// Every new registration must resolve before it reaches browser smoke checks.
for (const [id, item] of Object.entries(media)) {
  const filename = newsSourceFilename(item);
  const source = fs.readFileSync(path.join(postsDirectory, filename), 'utf8');
  assert.equal(newsSourceIdentity(item, source).effectiveSlug, item.slug,
    `${id}: source frontmatter must establish the registered public route`);
}
console.log(`news-media-source-file: PASS custom/legacy resolution, invalid paths, and ${Object.keys(media).length} registry source identities`);
