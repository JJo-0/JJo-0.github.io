import { buildPublicFeed } from '../../src/lib/analytics/public-feed.mjs';

// Server-side export only. Credentials never enter the public feed or browser bundle.
export async function fetchPublicAggregate({ propertyId, accessToken, fetchImpl = fetch, updatedAt }) {
  if (!/^\d+$/.test(propertyId || '')) throw new Error('Invalid numeric GA4 property ID');
  if (!accessToken) throw new Error('Missing short-lived GA4 access token');
  const response = await fetchImpl(
    'https://analyticsdata.googleapis.com/v1beta/properties/' + propertyId + ':runReport',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + accessToken,
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
  return buildPublicFeed(await response.json(), updatedAt);
}

