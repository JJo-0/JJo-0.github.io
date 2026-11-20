import type { CollectionEntry } from 'astro:content';
import { getEnglishPosts, pairForEnglish, type EnglishPost } from './english';
import { getPublishedPosts, getPostSlug } from './utils/posts';
import catalog from '@/data/english-post-cards.json';

type Post = CollectionEntry<'posts'>;
type Card = Pick<Post['data'], 'title' | 'description'>;
const cards: Record<string, Card> = catalog;

export async function getTranslationsBySource() {
  const translations = await getEnglishPosts();
  return new Map(translations.map(post => [pairForEnglish(post.data.slug).koSlug, post]));
}

export function getEnglishCard(source: Post, translation?: EnglishPost): Card {
  return translation?.data ?? cards[getPostSlug(source)] ?? source.data;
}

/** Preserve the source collection's identity, chronology, taxonomy and series order. */
export async function getLocalizedPosts(en: boolean): Promise<Post[]> {
  const sources = await getPublishedPosts();
  if (!en) return sources;
  const translations = await getTranslationsBySource();
  return sources.map(source => {
    const slug = getPostSlug(source);
    const translation = translations.get(slug);
    const card = getEnglishCard(source, translation);
    return {
      ...source,
      body: translation?.body ?? source.body,
      data: { ...source.data, lang: translation?.data.lang ?? source.data.lang, title: card.title, description: card.description },
    };
  });
}
