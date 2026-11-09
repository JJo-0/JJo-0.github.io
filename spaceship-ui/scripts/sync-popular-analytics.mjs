import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { EMPTY_PUBLIC_FEED } from '../src/lib/analytics/public-feed.mjs';
import { fetchPublicAggregate } from './lib/ga4-public-export.mjs';

const output = fileURLToPath(new URL('../site/assets/analytics/popular.json', import.meta.url));
const propertyId = (process.env.GA4_PROPERTY_ID || '').trim();
// Supplied for this step only by GitHub OIDC. No service account JSON key is used.
const accessToken = (process.env.GA4_ACCESS_TOKEN || '').trim();

async function writeFeed(feed) {
  await mkdir(new URL('../site/assets/analytics/', import.meta.url), { recursive: true });
  await writeFile(output, JSON.stringify(feed, null, 2) + '\n', 'utf8');
}

if (!propertyId || !accessToken) {
  console.info('GA4 export not configured; public popular posts remain empty.');
  await writeFeed(EMPTY_PUBLIC_FEED);
} else if (!/^\d+$/.test(propertyId)) {
  console.warn('GA4_PROPERTY_ID must be the numeric GA4 property ID, not a G- measurement ID.');
  await writeFeed(EMPTY_PUBLIC_FEED);
} else {
  try {
    const feed = await fetchPublicAggregate({ propertyId, accessToken });
    await writeFeed(feed);
    console.info('GA4 public aggregate refreshed (' + feed.posts.length + ' posts).');
  } catch {
    // API failure must not expose tokens, request headers, or private response bodies.
    console.warn('GA4 public aggregate refresh unavailable; check API activation and Viewer access.');
    await writeFeed(EMPTY_PUBLIC_FEED);
  }
}
