import assert from 'node:assert/strict';
import { EMPTY_PUBLIC_FEED, normalizePublicPostPath, buildPublicFeed } from '../src/lib/analytics/public-feed.mjs';

assert.equal(normalizePublicPostPath('/posts/example/'), '/posts/example');
assert.equal(normalizePublicPostPath('/en/posts/example/?q=a'), '/en/posts/example');
for (const path of ['/posts/', '/posts/tag/ai', '/', '//evil.example/posts/x', '/news', '/posts/x\\y']) {
  assert.equal(normalizePublicPostPath(path), null, 'unexpected public article path: ' + path);
}
const row = (path, title, views) => ({
  dimensionValues: [{ value: path }, { value: title }],
  metricValues: [{ value: String(views) }],
});
const feed = buildPublicFeed({ rows: [
  row('/posts/robot', 'Robot | Park JiHo', 8),
  row('/posts/robot/', 'Robot | Park JiHo', 3),
  row('/posts/ai', 'AI | Park JiHo', 12),
  row('/posts/tag/ai', 'Tag', 500),
  row('/news', 'News', 1000),
  row('/en/posts/robot', 'English Robot', 1),
] }, '2026-11-09T00:00:00.000Z');
assert.equal(feed.posts.length, 3);
assert.deepEqual(feed.posts.map((post) => post.views), [12, 11, 1]);
assert.equal(feed.posts[1].title, 'Robot');
assert.equal(feed.updatedAt, '2026-11-09T00:00:00.000Z');
assert.deepEqual(EMPTY_PUBLIC_FEED.posts, []);
console.log('Analytics aggregate contract passed');
