import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fetchPublicAggregate } from './lib/ga4-public-export.mjs';
import { EMPTY_PUBLIC_FEED, normalizePublicPostPath, buildPublicFeed } from '../src/lib/analytics/public-feed.mjs';
import { GOOGLE_READ_SCOPES, validateGoogleSession } from '../src/lib/analytics/google-session.mjs';

// Explicit synthetic grants. No live token or account is read by this contract.
const grant = { access_token: 'fixture-opaque-bearer', token_type: 'Bearer', expires_in: 3600, scope: GOOGLE_READ_SCOPES.join(' ') };
assert.equal(validateGoogleSession(grant).kind, 'ready');
assert.equal(validateGoogleSession({ ...grant, token_type: 'bearer' }).kind, 'ready');
for (const access_token of [null, {}, '', '[object Object]', 'Bearer fixture', 'fixture\r\nInjected: secret']) {
  assert.equal(validateGoogleSession({ ...grant, access_token }).kind, 'invalid-token');
}
assert.equal(validateGoogleSession({ ...grant, token_type: 'id_token' }).kind, 'invalid-token');
for (const expires_in of [undefined, 0, -1, 'invalid']) assert.equal(validateGoogleSession({ ...grant, expires_in }).kind, 'expired');
assert.equal(validateGoogleSession({ ...grant, scope: GOOGLE_READ_SCOPES[0] }).kind, 'missing-scopes');
assert.equal(validateGoogleSession({ ...grant, scope: undefined }).kind, 'missing-scopes');
assert.deepEqual(validateGoogleSession({ error: 'private-error-fixture', access_token: 'must-not-leak' }), { kind: 'oauth-error' });

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
// Explicit API fixture, not a claim of live Google connectivity.
let calls = 0;
const exported = await fetchPublicAggregate({
  propertyId: '123456', accessToken: 'fixture-ephemeral-token', updatedAt: '2026-11-09T00:00:00.000Z',
  fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url, 'https://analyticsdata.googleapis.com/v1beta/properties/123456:runReport');
    assert.equal(options.headers.Authorization, 'Bearer fixture-ephemeral-token');
    const query = JSON.parse(options.body);
    assert.deepEqual(query.dateRanges, [{ startDate: '30daysAgo', endDate: 'yesterday' }]);
    assert.deepEqual(query.dimensions, [{ name: 'pagePath' }, { name: 'pageTitle' }]);
    assert.ok(!options.body.includes('query') && !options.body.includes('userId'));
    return { ok: true, json: async () => ({ rows: Array.from({ length: 7 }, (_, i) => row('/posts/post-' + i, 'Post ' + i, i + 1)), privateExtra: 'must-not-leak' }) };
  },
});
assert.equal(calls, 1);
assert.equal(exported.posts.length, 5);
assert.deepEqual(Object.keys(exported).sort(), ['posts', 'updatedAt', 'version', 'window']);
for (const post of exported.posts) assert.deepEqual(Object.keys(post).sort(), ['path', 'title', 'views']);
assert.ok(!JSON.stringify(exported).includes('fixture-ephemeral-token') && !JSON.stringify(exported).includes('must-not-leak'));
const noFetch = () => { throw new Error('must not call Google'); };
await assert.rejects(fetchPublicAggregate({ propertyId: 'G-INVALID', accessToken: 'fixture', fetchImpl: noFetch }), /Invalid numeric/);
await assert.rejects(fetchPublicAggregate({ propertyId: '123', accessToken: '', fetchImpl: noFetch }), /Missing short-lived/);
await assert.rejects(fetchPublicAggregate({ propertyId: '123', accessToken: 'fixture', fetchImpl: async () => ({ ok: false, status: 403, json: () => { throw new Error('private response must not be parsed'); } }) }), /HTTP 403/);
const empty = await fetchPublicAggregate({ propertyId: '123', accessToken: 'fixture', fetchImpl: async () => ({ ok: true, json: async () => ({}) }) });
assert.deepEqual(empty.posts, []);
assert.ok(empty.updatedAt, 'successful zero-row report still has a refresh timestamp');
const workflow = await readFile(new URL('../../.github/workflows/blog-pages-deploy.yml', import.meta.url), 'utf8');
assert.match(workflow, /access_token_scopes: https:\/\/www\.googleapis\.com\/auth\/analytics\.readonly/);
assert.match(workflow, /access_token_lifetime: 600s/);
assert.match(workflow, /create_credentials_file: false/);
assert.match(workflow, /export_environment_variables: false/);
assert.ok(!workflow.includes('GA4_SERVICE_ACCOUNT_JSON'));
assert.equal(workflow.match(/steps\.ga4-auth\.outputs\.access_token/g)?.length, 1);
console.log('Analytics aggregate and keyless export contract passed');
