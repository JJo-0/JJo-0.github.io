import { getCollection, type CollectionEntry } from 'astro:content';
import edition from '../../site/english-edition.json';
export type EnglishPost = CollectionEntry<'englishPosts'>;
export const englishSlug = (post: EnglishPost): string => post.data.slug;
export const englishPostPath = (post: EnglishPost): string => `/en/posts/${post.data.slug}/`;
export function pairForEnglish(slug: string) {
  const pair = edition.pairs.find((item) => item.enSlug === slug);
  if (!pair) throw new Error(`English article is not registered: ${slug}`);
  return pair;
}
export async function getEnglishPosts(): Promise<EnglishPost[]> {
  const posts = (await getCollection('englishPosts')).filter((p) => !p.data.draft && p.data.pubDate <= new Date());
  for (const post of posts) {
    const pair = pairForEnglish(post.data.slug);
    if (pair.key !== post.data.translationKey || post.data.translatedPosts['ko-KR'] !== pair.koSlug) {
      throw new Error(`Translation pair mismatch: ${post.id}`);
    }
  }
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.data.slug.localeCompare(b.data.slug));
}
export const isEnglishNews = (post: EnglishPost) => post.data.tags.some((tag) => tag === 'frontier-one' || tag === 'frontier-candidate');
