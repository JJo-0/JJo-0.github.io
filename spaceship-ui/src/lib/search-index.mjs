// In-memory, per-language cache. No persistent storage or saved queries.
const TTL_MS = 5 * 60 * 1000;
export const SEARCH_PAGE_SIZE = 30;

/** @typedef {{id:string,href?:string,data:{title:string,description:string}}} SearchRow */
/** @typedef {SearchRow & {titleLower:string,descriptionLower:string}} PreparedRow */

/** @param {SearchRow[]} rows @returns {PreparedRow[]} */
export function prepareSearchRows(rows) {
  if (!Array.isArray(rows)) throw new Error('Invalid search index');
  return rows.map(row => {
    if (typeof row?.id !== 'string' || typeof row.data?.title !== 'string' ||
        typeof row.data?.description !== 'string' ||
        (row.href !== undefined && (typeof row.href !== 'string' || !/^\/en\/posts\//.test(row.href)))) {
      throw new Error('Invalid search entry');
    }
    return { ...row, titleLower: row.data.title.toLowerCase(), descriptionLower: row.data.description.toLowerCase() };
  });
}

/** @param {PreparedRow[]} rows @param {string} query */
export function matchSearchRows(rows, query) {
  const term = query.trim().toLowerCase();
  if (!term) return [];
  return rows.filter(row => row.titleLower.includes(term) || row.descriptionLower.includes(term));
}

export function createSearchIndexLoader(fetchImpl = fetch, now = Date.now) {
  /** @type {Map<string,{rows?:PreparedRow[],expires:number,pending?:Promise<PreparedRow[]>}>} */
  const cache = new Map();
  /** @param {string} language */
  return function load(language) {
    const prefix = language.toLowerCase().startsWith('en') ? '/en' : '';
    const entry = cache.get(prefix);
    if (entry?.pending) return entry.pending;
    if (entry?.rows && now() < entry.expires) return Promise.resolve(entry.rows);
    const pending = Promise.resolve().then(async () => {
      const response = await fetchImpl(prefix + '/api/search.json', {
        credentials: 'same-origin',
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error('Search index request failed');
      const rows = prepareSearchRows(await response.json());
      cache.set(prefix, { rows, expires: now() + TTL_MS });
      return rows;
    });
    cache.set(prefix, { expires: 0, pending });
    pending.catch(() => {
      if (cache.get(prefix)?.pending === pending) cache.delete(prefix);
    });
    return pending;
  };
}
export const loadSearchIndex = createSearchIndexLoader();
