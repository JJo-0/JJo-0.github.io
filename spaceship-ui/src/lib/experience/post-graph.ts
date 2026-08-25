import type { CollectionEntry } from 'astro:content';
import { getPostSlug } from '@/lib/utils/posts';
export interface PostGraphNode {
  id: string;
  title: string;
  href: string;
  category: string;
  subcategory: string;
  type: string;
  tags: string[];
  x: number;
  y: number;
  z: number;
}
export interface PostGraphEdge {
  source: string;
  target: string;
  weight: number;
  reasons: string[];
}
export interface PostGraph {
  nodes: PostGraphNode[];
  edges: PostGraphEdge[];
}
const STOP_WORDS = new Set([
  'about',
  'after',
  'also',
  'from',
  'into',
  'that',
  'this',
  'through',
  'using',
  'with',
  '그리고',
  '대한',
  '위한',
  '통해',
  '하는',
  '있는',
  '정리',
  '연구',
  '분석',
]);
function hash(value: string) {
  let output = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    output ^= value.charCodeAt(i);
    output = Math.imul(output, 16777619);
  }
  return output >>> 0;
}
function keywords(post: CollectionEntry<'posts'>) {
  const source = `${post.data.title} ${post.data.description} ${post.body ?? ''}`
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .toLowerCase();
  const tokens = source.match(/[a-z][a-z0-9-]{3,}|[가-힣]{2,}/g) ?? [];
  return new Set(tokens.filter((token) => !STOP_WORDS.has(token)).slice(0, 240));
}
export function buildPostGraph(posts: CollectionEntry<'posts'>[]): PostGraph {
  const categories = [...new Set(posts.map((post) => post.data.category))];
  const keywordSets = new Map(posts.map((post) => [post.id, keywords(post)]));
  const nodes = posts.map((post, index): PostGraphNode => {
    const ci = Math.max(0, categories.indexOf(post.data.category)),
      angle = (ci / Math.max(1, categories.length)) * Math.PI * 2 - Math.PI / 2,
      seed = hash(post.id),
      local = ((seed % 1000) / 1000) * Math.PI * 2,
      radius = 0.32 + (((seed >>> 10) % 1000) / 1000) * 0.5,
      cluster = categories.length > 1 ? 1.52 : 0;
    return {
      id: `post-${index}`,
      title: post.data.title,
      href: `/posts/${getPostSlug(post)}`,
      category: post.data.category,
      subcategory: post.data.subcategory,
      type: post.data.type,
      tags: post.data.tags,
      x: Math.cos(angle) * cluster + Math.cos(local) * radius,
      y: Math.sin(angle) * cluster + Math.sin(local) * radius,
      z: (((seed >>> 20) % 1000) / 1000 - 0.5) * 3.8,
    };
  });
  const candidates: PostGraphEdge[] = [];
  for (let l = 0; l < posts.length; l += 1)
    for (let r = l + 1; r < posts.length; r += 1) {
      const a = posts[l],
        b = posts[r];
      if (!a || !b) continue;
      const reasons: string[] = [];
      let score = 0;
      if (a.data.researchArea && a.data.researchArea === b.data.researchArea) {
        score += 5;
        reasons.push('same research area');
      }
      if (a.data.category === b.data.category) {
        score += 4;
        reasons.push('same category');
      }
      if (a.data.subcategory === b.data.subcategory) {
        score += 3;
        reasons.push('same subcategory');
      }
      if (a.data.type === b.data.type) score += 0.6;
      const sharedTags = a.data.tags.filter((tag) => b.data.tags.includes(tag));
      if (sharedTags.length) {
        score += sharedTags.length * 2.5;
        reasons.push(`#${sharedTags.slice(0, 2).join(' · #')}`);
      }
      const ak = keywordSets.get(a.id) ?? new Set<string>(),
        bk = keywordSets.get(b.id) ?? new Set<string>();
      let shared = 0;
      for (const token of ak) if (bk.has(token)) shared += 1;
      if (shared >= 3) {
        score += Math.min(3, shared * 0.18);
        reasons.push(`${shared} shared terms`);
      }
      if (score >= 3)
        candidates.push({
          source: `post-${l}`,
          target: `post-${r}`,
          weight: Number(score.toFixed(2)),
          reasons: reasons.slice(0, 3),
        });
    }
  candidates.sort((a, b) => b.weight - a.weight);
  const degrees = new Map(nodes.map((node) => [node.id, 0]));
  const edges = candidates.filter((edge) => {
    const a = degrees.get(edge.source) ?? 0,
      b = degrees.get(edge.target) ?? 0;
    if (a >= 4 || b >= 4) return false;
    degrees.set(edge.source, a + 1);
    degrees.set(edge.target, b + 1);
    return true;
  });
  return { nodes, edges };
}
