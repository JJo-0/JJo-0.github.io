import edition from '../../site/english-edition.json';
export const EN_DESCRIPTION = 'Research notes on robotics, artificial intelligence, computer vision, and systems engineering by Jiho Park.';
const fixedPairs: Array<[string, string]> = [
  ['/', '/en/'], ['/research', '/en/research/'], ['/about', '/en/about/'], ['/news', '/en/news/'],
];
export const normalizeLocalePath = (path: string): string => path === '/' ? '/' : path.replace(/\/+$/, '');
/** Only equivalent published content is an SEO alternate. Pending writing is not. */
export function nativeAlternates(path: string): Record<string, string> {
  const key = normalizeLocalePath(path);
  const pairs = [...fixedPairs, ...edition.pairs.map((p): [string, string] => [`/posts/${p.koSlug}/`, `/en/posts/${p.enSlug}/`])];
  const pair = pairs.find((p) => p.some((item) => normalizeLocalePath(item) === key));
  return pair ? { 'ko-KR': pair[0], en: pair[1], 'x-default': pair[0] } : {};
}
export function englishSwitchPath(path: string): string {
  const translated = nativeAlternates(path).en;
  if (translated) return translated;
  return `/en/translations/?from=${encodeURIComponent(path)}`;
}
