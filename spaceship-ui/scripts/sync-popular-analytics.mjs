import { createSign } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { EMPTY_PUBLIC_FEED, buildPublicFeed } from '../src/lib/analytics/public-feed.mjs';

const output = fileURLToPath(new URL('../site/assets/analytics/popular.json', import.meta.url));
const propertyId = (process.env.GA4_PROPERTY_ID || '').trim();
const credentialText = (process.env.GA4_SERVICE_ACCOUNT_JSON || '').trim();
const scopes = 'https://www.googleapis.com/auth/analytics.readonly';

function parseCredentials(value) {
  try {
    return JSON.parse(value);
  } catch {
    return JSON.parse(Buffer.from(value, 'base64').toString('utf8'));
  }
}

function signAssertion(account) {
  if (typeof account.client_email !== 'string' || typeof account.private_key !== 'string') {
    throw new Error('GA4 service account requires client_email and private_key');
  }
  const issuedAt = Math.floor(Date.now() / 1000);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const message = encode({ alg: 'RS256', typ: 'JWT' }) + '.' + encode({
    iss: account.client_email,
    scope: scopes,
    aud: 'https://oauth2.googleapis.com/token',
    iat: issuedAt,
    exp: issuedAt + 3000,
  });
  const signer = createSign('RSA-SHA256');
  signer.update(message);
  signer.end();
  return message + '.' + signer.sign(account.private_key, 'base64url');
}

async function getAccessToken(account) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signAssertion(account),
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('Google OAuth token request: HTTP ' + response.status);
  const payload = await response.json();
  if (typeof payload.access_token !== 'string') throw new Error('Google OAuth token missing');
  return payload.access_token;
}

async function getReport(token) {
  const response = await fetch(
    'https://analyticsdata.googleapis.com/v1beta/properties/' + propertyId + ':runReport',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: '30daysAgo', endDate: 'yesterday' }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: { matchType: 'PARTIAL_REGEXP', value: '^/(en/)?posts/' },
          },
        },
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10000,
      }),
      signal: AbortSignal.timeout(30000),
    }
  );
  if (!response.ok) throw new Error('GA4 Data API: HTTP ' + response.status);
  return response.json();
}

async function writeFeed(feed) {
  await mkdir(new URL('../site/assets/analytics/', import.meta.url), { recursive: true });
  await writeFile(output, JSON.stringify(feed, null, 2) + '\n', 'utf8');
}

if (!propertyId || !credentialText) {
  console.info('GA4 export not configured; public popular posts remain empty.');
  await writeFeed(EMPTY_PUBLIC_FEED);
} else if (!/^\d+$/.test(propertyId)) {
  console.warn('GA4_PROPERTY_ID must be the numeric GA4 property ID, not a G- measurement ID.');
  await writeFeed(EMPTY_PUBLIC_FEED);
} else {
  try {
    const token = await getAccessToken(parseCredentials(credentialText));
    const report = await getReport(token);
    const feed = buildPublicFeed(report);
    await writeFeed(feed);
    console.info('GA4 public aggregate refreshed (' + feed.posts.length + ' posts).');
  } catch (error) {
    // A reporting API outage must not block the whole blog deployment.
    // Never print credentials, tokens, or the sensitive response body.
    console.warn('GA4 public aggregate refresh unavailable: ' + (error?.message || 'unknown error'));
    await writeFeed(EMPTY_PUBLIC_FEED);
  }
}
