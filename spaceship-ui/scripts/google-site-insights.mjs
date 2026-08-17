import { createSign, generateKeyPairSync } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters',
];
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

function env(name, fallback = '') {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

function boolEnv(name, fallback = false) {
  const value = env(name, String(fallback)).toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(value);
}

function integerEnv(name, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const value = Number.parseInt(env(name, String(fallback)), 10);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}.`);
  }
  return value;
}

function base64url(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return buffer.toString('base64url');
}

function createJwtAssertion(credentials, scopes, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!credentials?.client_email || !credentials?.private_key) {
    throw new Error('Service-account JSON must contain client_email and private_key.');
  }

  const header = {
    alg: 'RS256',
    typ: 'JWT',
    ...(credentials.private_key_id ? { kid: credentials.private_key_id } : {}),
  };
  const payload = {
    iss: credentials.client_email,
    scope: scopes.join(' '),
    aud: TOKEN_ENDPOINT,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(credentials.private_key);
  return `${signingInput}.${base64url(signature)}`;
}

async function exchangeJwtForAccessToken(credentials) {
  const assertion = createJwtAssertion(credentials, SCOPES);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) {
    throw new Error(`OAuth token exchange failed (${response.status}): ${JSON.stringify(payload)}`);
  }
  return payload.access_token;
}

async function googleRequest(url, accessToken, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('authorization', `Bearer ${accessToken}`);
  if (options.body && !headers.has('content-type')) headers.set('content-type', 'application/json');

  const response = await fetch(url, { ...options, headers });
  const text = await response.text();
  const payload = text ? safeJson(text) : null;
  if (!response.ok) {
    const detail = typeof payload === 'string' ? payload : JSON.stringify(payload);
    throw new Error(`${options.method || 'GET'} ${url} failed (${response.status}): ${detail}`);
  }
  return payload;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function encodePath(value) {
  return encodeURIComponent(value);
}

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function parseLocs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeXml(match[1].trim()));
}

async function fetchPublicText(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'JJo-0-site-insights/1.0' } });
  if (!response.ok) throw new Error(`GET ${url} failed (${response.status}).`);
  return response.text();
}

async function collectSitemapUrls(sitemapUrl) {
  const rootXml = await fetchPublicText(sitemapUrl);
  const rootLocs = parseLocs(rootXml);
  const isIndex = /<sitemapindex\b/i.test(rootXml);
  if (!isIndex) return rootLocs;

  const pages = [];
  for (const childUrl of rootLocs) {
    const childXml = await fetchPublicText(childUrl);
    pages.push(...parseLocs(childXml));
  }
  return [...new Set(pages)];
}

function dateDaysAgo(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function gaRows(response) {
  const dimensionNames = (response.dimensionHeaders || []).map((item) => item.name);
  const metricNames = (response.metricHeaders || []).map((item) => item.name);
  return (response.rows || []).map((row) => ({
    dimensions: Object.fromEntries(
      dimensionNames.map((name, index) => [name, row.dimensionValues?.[index]?.value ?? '']),
    ),
    metrics: Object.fromEntries(
      metricNames.map((name, index) => [name, row.metricValues?.[index]?.value ?? '0']),
    ),
  }));
}

async function runGa4Report(accessToken, propertyId) {
  const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`;
  const call = (body) =>
    googleRequest(endpoint, accessToken, { method: 'POST', body: JSON.stringify(body) });
  const dateRanges = [{ startDate: '28daysAgo', endDate: 'yesterday' }];

  const [overview, pages, channels, events] = await Promise.all([
    call({
      dateRanges,
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'engagedSessions' },
        { name: 'screenPageViews' },
        { name: 'eventCount' },
      ],
    }),
    call({
      dateRanges,
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: '25',
    }),
    call({
      dateRanges,
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: '20',
    }),
    call({
      dateRanges,
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: '25',
    }),
  ]);

  return {
    dateRange: { startDate: '28daysAgo', endDate: 'yesterday' },
    overview: gaRows(overview)[0]?.metrics || {},
    topPages: gaRows(pages),
    channels: gaRows(channels),
    events: gaRows(events),
    propertyQuota: overview.propertyQuota || null,
  };
}

async function listSearchConsoleSites(accessToken) {
  return googleRequest('https://www.googleapis.com/webmasters/v3/sites', accessToken);
}

async function listSitemaps(accessToken, siteUrl) {
  return googleRequest(
    `https://www.googleapis.com/webmasters/v3/sites/${encodePath(siteUrl)}/sitemaps`,
    accessToken,
  );
}

async function submitSitemap(accessToken, siteUrl, sitemapUrl) {
  return googleRequest(
    `https://www.googleapis.com/webmasters/v3/sites/${encodePath(siteUrl)}/sitemaps/${encodePath(sitemapUrl)}`,
    accessToken,
    { method: 'PUT' },
  );
}

async function querySearchAnalytics(accessToken, siteUrl, dimensions = []) {
  const body = {
    startDate: dateDaysAgo(28),
    endDate: dateDaysAgo(1),
    dimensions,
    rowLimit: dimensions.length ? 25 : 1,
    dataState: 'all',
  };
  return googleRequest(
    `https://www.googleapis.com/webmasters/v3/sites/${encodePath(siteUrl)}/searchAnalytics/query`,
    accessToken,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

function searchRows(response, dimensions) {
  return (response.rows || []).map((row) => ({
    dimensions: Object.fromEntries(dimensions.map((name, index) => [name, row.keys?.[index] ?? ''])),
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));
}

async function inspectOneUrl(accessToken, siteUrl, inspectionUrl) {
  const response = await googleRequest(
    'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({ inspectionUrl, siteUrl, languageCode: 'ko-KR' }),
    },
  );
  const result = response.inspectionResult || {};
  const index = result.indexStatusResult || {};
  return {
    url: inspectionUrl,
    verdict: index.verdict || 'VERDICT_UNSPECIFIED',
    coverageState: index.coverageState || '',
    indexingState: index.indexingState || '',
    pageFetchState: index.pageFetchState || '',
    robotsTxtState: index.robotsTxtState || '',
    lastCrawlTime: index.lastCrawlTime || null,
    googleCanonical: index.googleCanonical || null,
    userCanonical: index.userCanonical || null,
    crawledAs: index.crawledAs || null,
    inspectionResultLink: result.inspectionResultLink || null,
  };
}

async function mapConcurrent(values, concurrency, mapper) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = await mapper(values[index], index);
      } catch (error) {
        results[index] = { url: values[index], error: error instanceof Error ? error.message : String(error) };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()));
  return results;
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function percent(value) {
  return `${(number(value) * 100).toFixed(2)}%`;
}

function markdownTable(headers, rows) {
  if (!rows.length) return '_데이터 없음_\n';
  const escape = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
  return [
    `| ${headers.map((header) => escape(header)).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map((cell) => escape(cell)).join(' | ')} |`),
    '',
  ].join('\n');
}

function buildMarkdown(report) {
  const lines = [
    '# Google Site Insights',
    '',
    `- 생성 시각: ${report.generatedAt}`,
    `- GA4 속성: ${report.config.ga4PropertyId}`,
    `- Search Console 속성: ${report.config.searchConsoleSiteUrl}`,
    `- 조회 기간: ${report.dateRange.startDate} ~ ${report.dateRange.endDate}`,
    '',
  ];

  if (report.ga4?.data) {
    const overview = report.ga4.data.overview;
    lines.push(
      '## GA4 개요',
      '',
      markdownTable(
        ['활성 사용자', '세션', '참여 세션', '페이지 조회', '이벤트'],
        [[
          overview.activeUsers || 0,
          overview.sessions || 0,
          overview.engagedSessions || 0,
          overview.screenPageViews || 0,
          overview.eventCount || 0,
        ]],
      ),
      '### 조회 상위 페이지',
      '',
      markdownTable(
        ['경로', '조회', '활성 사용자'],
        report.ga4.data.topPages.slice(0, 15).map((row) => [
          row.dimensions.pagePath,
          row.metrics.screenPageViews,
          row.metrics.activeUsers,
        ]),
      ),
      '### 유입 채널',
      '',
      markdownTable(
        ['채널', '세션', '참여 세션'],
        report.ga4.data.channels.map((row) => [
          row.dimensions.sessionDefaultChannelGroup,
          row.metrics.sessions,
          row.metrics.engagedSessions,
        ]),
      ),
    );
  } else {
    lines.push('## GA4', '', `실패: ${report.ga4?.error || '알 수 없는 오류'}`, '');
  }

  if (report.searchConsole?.data) {
    const data = report.searchConsole.data;
    const overview = data.overview?.[0];
    lines.push(
      '## Google Search Console',
      '',
      markdownTable(
        ['클릭', '노출', 'CTR', '평균 순위'],
        overview
          ? [[overview.clicks, overview.impressions, percent(overview.ctr), number(overview.position).toFixed(2)]]
          : [],
      ),
      '### 검색어',
      '',
      markdownTable(
        ['검색어', '클릭', '노출', 'CTR', '평균 순위'],
        data.queries.map((row) => [
          row.dimensions.query,
          row.clicks,
          row.impressions,
          percent(row.ctr),
          number(row.position).toFixed(2),
        ]),
      ),
      '### 검색 노출 페이지',
      '',
      markdownTable(
        ['페이지', '클릭', '노출', 'CTR', '평균 순위'],
        data.pages.map((row) => [
          row.dimensions.page,
          row.clicks,
          row.impressions,
          percent(row.ctr),
          number(row.position).toFixed(2),
        ]),
      ),
      '### 색인 점검',
      '',
      markdownTable(
        ['URL', '판정', '상태', '마지막 크롤링'],
        data.inspections.slice(0, 100).map((item) => [
          item.url,
          item.error ? 'ERROR' : item.verdict,
          item.error || item.coverageState || item.indexingState,
          item.lastCrawlTime || '',
        ]),
      ),
    );
  } else {
    lines.push(
      '## Google Search Console',
      '',
      `실패: ${report.searchConsole?.error || '알 수 없는 오류'}`,
      '',
    );
  }

  if (report.notes.length) {
    lines.push('## 주의 사항', '', ...report.notes.map((note) => `- ${note}`), '');
  }
  return lines.join('\n');
}

async function writeReport(report) {
  const outputDir = path.join(process.cwd(), 'reports', 'google-site-insights');
  await fs.mkdir(outputDir, { recursive: true });
  const stamp = report.generatedAt.replaceAll(':', '-').replaceAll('.', '-');
  const jsonPath = path.join(outputDir, `${stamp}.json`);
  const markdownPath = path.join(outputDir, `${stamp}.md`);
  const markdown = buildMarkdown(report);
  await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await fs.writeFile(markdownPath, `${markdown}\n`, 'utf8');

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) await fs.appendFile(summaryPath, `${markdown}\n`, 'utf8');
  console.log(`Wrote ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Wrote ${path.relative(process.cwd(), markdownPath)}`);
}

async function selfTest() {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const credentials = {
    client_email: 'test@example.iam.gserviceaccount.com',
    private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
    private_key_id: 'test-key',
  };
  const jwt = createJwtAssertion(credentials, SCOPES, 1_700_000_000);
  const [headerPart, payloadPart, signaturePart] = jwt.split('.');
  const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8'));
  const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
  if (header.alg !== 'RS256' || !signaturePart) throw new Error('JWT signing self-test failed.');
  if (!payload.scope.includes('analytics.readonly') || !payload.scope.includes('webmasters')) {
    throw new Error('JWT scope self-test failed.');
  }
  const urls = parseLocs('<urlset><url><loc>https://example.com/a&amp;b</loc></url></urlset>');
  if (urls[0] !== 'https://example.com/a&b') throw new Error('Sitemap parser self-test failed.');
  const rows = gaRows({
    dimensionHeaders: [{ name: 'pagePath' }],
    metricHeaders: [{ name: 'screenPageViews' }],
    rows: [{ dimensionValues: [{ value: '/a' }], metricValues: [{ value: '4' }] }],
  });
  if (rows[0]?.dimensions.pagePath !== '/a' || rows[0]?.metrics.screenPageViews !== '4') {
    throw new Error('GA row parser self-test failed.');
  }
  console.log('google-site-insights: self-test PASS');
}

async function main() {
  if (process.argv.includes('--self-test')) {
    await selfTest();
    return;
  }

  const credentialsText = env('GOOGLE_REPORTING_CREDENTIALS');
  if (!credentialsText) {
    throw new Error('Missing GOOGLE_REPORTING_CREDENTIALS. See docs/google-site-insights.md.');
  }
  const credentials = JSON.parse(credentialsText);
  const ga4PropertyId = env('GA4_PROPERTY_ID', '486835586');
  const searchConsoleSiteUrl = env('SEARCH_CONSOLE_SITE_URL', 'https://jjo-0.github.io/');
  const sitemapUrl = env(
    'SEARCH_CONSOLE_SITEMAP_URL',
    'https://jjo-0.github.io/sitemap-index.xml',
  );
  const submitSitemap = boolEnv('SUBMIT_SITEMAP', false);
  const inspectUrls = boolEnv('INSPECT_URLS', true);
  const inspectLimit = integerEnv('INSPECT_LIMIT', 100, { min: 0, max: 500 });
  const accessToken = await exchangeJwtForAccessToken(credentials);
  const generatedAt = new Date().toISOString();
  const report = {
    generatedAt,
    dateRange: { startDate: dateDaysAgo(28), endDate: dateDaysAgo(1) },
    config: { ga4PropertyId, searchConsoleSiteUrl, sitemapUrl, submitSitemap, inspectUrls, inspectLimit },
    ga4: null,
    searchConsole: null,
    notes: [
      '이 보고서는 집계 데이터만 저장하며 서비스 계정 키와 OAuth 토큰은 저장하지 않는다.',
      '일반 블로그 글에는 Google Indexing API를 사용하지 않는다. 색인 발견은 sitemap과 URL Inspection으로 확인한다.',
    ],
  };

  try {
    report.ga4 = { data: await runGa4Report(accessToken, ga4PropertyId) };
  } catch (error) {
    report.ga4 = { error: error instanceof Error ? error.message : String(error) };
  }

  try {
    const sites = await listSearchConsoleSites(accessToken);
    const matchingSite = (sites.siteEntry || []).find((site) => site.siteUrl === searchConsoleSiteUrl);
    if (!matchingSite) {
      const available = (sites.siteEntry || []).map((site) => site.siteUrl).join(', ') || 'none';
      throw new Error(
        `Service account cannot access ${searchConsoleSiteUrl}. Accessible properties: ${available}`,
      );
    }

    if (submitSitemap) await submitSitemap(accessToken, searchConsoleSiteUrl, sitemapUrl);
    const [sitemaps, overviewRaw, queriesRaw, pagesRaw, sitemapUrls] = await Promise.all([
      listSitemaps(accessToken, searchConsoleSiteUrl),
      querySearchAnalytics(accessToken, searchConsoleSiteUrl),
      querySearchAnalytics(accessToken, searchConsoleSiteUrl, ['query']),
      querySearchAnalytics(accessToken, searchConsoleSiteUrl, ['page']),
      inspectUrls ? collectSitemapUrls(sitemapUrl) : Promise.resolve([]),
    ]);

    const targets = sitemapUrls.slice(0, inspectLimit);
    const inspections = inspectUrls
      ? await mapConcurrent(targets, 5, (url) => inspectOneUrl(accessToken, searchConsoleSiteUrl, url))
      : [];

    report.searchConsole = {
      data: {
        permissionLevel: matchingSite.permissionLevel || '',
        sitemapSubmitted: submitSitemap,
        sitemaps: sitemaps.sitemap || [],
        overview: searchRows(overviewRaw, []),
        queries: searchRows(queriesRaw, ['query']),
        pages: searchRows(pagesRaw, ['page']),
        inspectedUrlCount: inspections.length,
        inspections,
      },
    };
  } catch (error) {
    report.searchConsole = { error: error instanceof Error ? error.message : String(error) };
  }

  await writeReport(report);
  if (!report.ga4?.data && !report.searchConsole?.data) {
    throw new Error('Both GA4 and Search Console reporting failed. Review the generated report.');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
