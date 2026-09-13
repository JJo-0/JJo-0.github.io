import type { CollectionEntry } from 'astro:content';
import { getPostSlug } from '@/lib/utils/posts';

export type Locale = 'ko' | 'en';
export function localeOf(lang: string = 'ko'): Locale {
  return lang.toLowerCase().startsWith('en') ? 'en' : 'ko';
}
export function postPath(post: CollectionEntry<'posts'>): string {
  return `${localeOf(post.data.lang) === 'en' ? '/en' : ''}/posts/${getPostSlug(post)}/`;
}
export function ogLocale(lang: string): string {
  return localeOf(lang) === 'en' ? 'en_US' : 'ko_KR';
}
/** Resolve only real, reciprocal, published translations. Broken declarations fail the build. */
export function postAlternates(post: CollectionEntry<'posts'>, all: CollectionEntry<'posts'>[]): Record<string, string> {
  const selfLocale = localeOf(post.data.lang);
  const result: Record<string, string> = { [selfLocale === 'ko' ? 'ko-KR' : 'en']: postPath(post) };
  for (const [language, slug] of Object.entries(post.data.translatedPosts ?? {})) {
    const locale = localeOf(language);
    const target = all.find((candidate) => localeOf(candidate.data.lang) === locale && getPostSlug(candidate) === slug);
    if (!target || target.data.draft || target.data.pubDate > new Date()) {
      throw new Error(`${post.id}: unavailable translation ${language}:${slug}`);
    }
    const back = Object.entries(target.data.translatedPosts ?? {}).find(([lang]) => localeOf(lang) === selfLocale)?.[1];
    if (back !== getPostSlug(post) || !post.data.translationKey || target.data.translationKey !== post.data.translationKey) {
      throw new Error(`${post.id}: non-reciprocal translation ${target.id}`);
    }
    result[locale === 'ko' ? 'ko-KR' : 'en'] = postPath(target);
  }
  if (result.en && result['ko-KR']) result['x-default'] = result['ko-KR'];
  return result;
}
