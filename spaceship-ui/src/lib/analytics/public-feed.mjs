// Public GA4 aggregate helpers. No credentials, identifiers or visitor-level data here.
export const EMPTY_PUBLIC_FEED = Object.freeze({
  version: 1,
  updatedAt: null,
  window: 'previous-30-complete-days',
  posts: [],
});

export function normalizePublicPostPath(input) {
  if (typeof input !== 'string' || input.length > 512) return null;
  const raw = input.trim();
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return null;
  let path;
  try {
    path = new URL(raw, 'https://jjo-0.github.io').pathname.replace(/\/+$/, '');
  } catch {
    return null;
  }
  if (!/^\/(?:en\/)?posts\/[a-zA-Z0-9%._~/-]+$/.test(path)) return null;
  if (/^\/(?:en\/)?posts\/tag(?:\/|$)/.test(path) || path.includes('//')) return null;
  return path;
}

function cleanTitle(input, path) {
  const title = String(input || '')
    .replace(/\s*[|｜]\s*Park JiHo\s*$/i, '')
    .trim()
    .slice(0, 180);
  return title || decodeURIComponent(path.split('/').pop() || 'Writing');
}

export function buildPublicFeed(report, updatedAt = new Date().toISOString()) {
  const grouped = new Map();
  for (const row of report?.rows ?? []) {
    const path = normalizePublicPostPath(row.dimensionValues?.[0]?.value);
    const views = Number(row.metricValues?.[0]?.value);
    if (!path || !Number.isSafeInteger(views) || views < 0) continue;
    const title = cleanTitle(row.dimensionValues?.[1]?.value, path);
    const prior = grouped.get(path);
    grouped.set(path, {
      path,
      title: prior && prior.views >= views ? prior.title : title,
      views: (prior?.views ?? 0) + views,
    });
  }
  const posts = [...grouped.values()]
    .filter((post) => post.views > 0)
    .sort((a, b) => b.views - a.views || a.path.localeCompare(b.path))
    .slice(0, 5);
  return { version: 1, updatedAt, window: 'previous-30-complete-days', posts };
}
