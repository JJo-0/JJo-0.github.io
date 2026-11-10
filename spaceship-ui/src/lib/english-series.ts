import { getPublishedPosts, getPostSeriesId, getPostSlug, compareSeriesPosts } from './utils/posts';
import { getEnglishPosts, pairForEnglish } from './english';
import type { EnglishPost } from './english';

export const ENGLISH_SERIES_TITLES: Record<string, string> = {
  'rl-robot-learning': 'Reinforcement Learning for Robotics',
  'modern-artificial-intelligence': 'Modern Artificial Intelligence',
  'ai-consciousness-deep-research': 'Is AI Conscious?',
  'data-structures-coding-tests': 'Data Structures and Coding Tests',
  supplements: 'Supplements: Magnesium, B Vitamins and Omega-3',
  'acts-study': 'Acts: Overview and Chapter 1',
  'acts-pentecost-study': 'Acts 2:14–37',
  'ezekiel-study': 'Ezekiel 2:1–3:11',
  'isaiah-study': 'Isaiah 43:18–21',
  'soc-from-code-to-chip': 'From Code to Chip',
  'human-motion-study': 'Human and Robotics',
};

export async function getEnglishSeries() {
  const [sources, english] = await Promise.all([getPublishedPosts(), getEnglishPosts()]);
  const byOriginal = new Map(english.map(post => [pairForEnglish(post.data.slug).koSlug, post]));
  const groups = new Map<string, typeof sources>();
  for (const source of sources) {
    const id = getPostSeriesId(source);
    if (id) groups.set(id, [...(groups.get(id) || []), source]);
  }
  return [...groups].map(([id, originals]) => ({
    id, title: ENGLISH_SERIES_TITLES[id] || id,
    entries: originals.sort((a, b) => compareSeriesPosts(a, b, id)).map(original => ({
      original, sourceSlug: getPostSlug(original), translation: byOriginal.get(getPostSlug(original)),
    })),
    translated: originals.filter(original => byOriginal.has(getPostSlug(original))).length,
  })).sort((a, b) => a.title.localeCompare(b.title));
}

export async function seriesForEnglish(post: EnglishPost) {
  const source = pairForEnglish(post.data.slug).koSlug;
  return (await getEnglishSeries()).find(group => group.entries.some(entry => entry.sourceSlug === source));
}
