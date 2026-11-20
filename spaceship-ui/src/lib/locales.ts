import edition from '../../site/english-edition.json';

export const EN_DESCRIPTION = 'Research notes on robotics, artificial intelligence, computer vision, and systems engineering by Jiho Park.';
export const normalizeLocalePath = (path: string): string => path.replace(/\/+$/, '') || '/';

const sectionPaths = new Set([
  '/', '/research', '/about', '/news', '/posts', '/bible', '/bible/reading-guide',
  '/policies', '/policies/copyright', '/policies/disclaimer', '/policies/health', '/policies/finance',
  '/notices/2026-09-11-biblical-studies-and-policies',
]);
const enByKo = new Map(edition.pairs.map(({ koSlug, enSlug }) => [koSlug, enSlug]));
const koByEn = new Map(edition.pairs.map(({ koSlug, enSlug }) => [enSlug, koSlug]));

export function englishPostPathForSlug(koSlug: string): string {
  return `/en/posts/${enByKo.get(koSlug) ?? koSlug}/`;
}

/** Only full translations and equivalent index pages are SEO alternates. */
export function nativeAlternates(path: string): Record<string, string> {
  const key = normalizeLocalePath(path);
  const isEnglish = key === '/en' || key.startsWith('/en/');
  const source = isEnglish ? key.slice(3) || '/' : key;
  if (sectionPaths.has(source) || /^\/posts\/tag\/[^/]+$/.test(source)) {
    const en = source === '/' ? '/en/' : `/en${source}/`;
    return { 'ko-KR': source, en, 'x-default': source };
  }
  if (!source.startsWith('/posts/')) return {};
  const slug = source.slice('/posts/'.length);
  const koSlug = isEnglish ? koByEn.get(slug) : enByKo.has(slug) ? slug : undefined;
  if (!koSlug) return {};
  const ko = `/posts/${koSlug}/`;
  return { 'ko-KR': ko, en: englishPostPathForSlug(koSlug), 'x-default': ko };
}

/** Also accepts a published original whose body is offered inside the English interface. */
export function englishSwitchPath(path: string): string | undefined {
  const native = nativeAlternates(path).en;
  if (native) return native;
  const source = normalizeLocalePath(path);
  return source.startsWith('/posts/') ? englishPostPathForSlug(source.slice('/posts/'.length)) : undefined;
}

export function koreanSwitchPath(path: string): string | undefined {
  const native = nativeAlternates(path)['ko-KR'];
  if (native) return native;
  const key = normalizeLocalePath(path);
  if (key.startsWith('/en/posts/')) return `${key.slice(3)}/`;
  if (key === '/en/translations') return '/posts';
  if (key === '/en/404') return '/404';
  return undefined;
}
