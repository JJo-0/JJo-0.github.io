import type { CollectionEntry } from 'astro:content';
import { englishPostPathForSlug } from '@/lib/locales';
import { getPostSlug, getPublishedPosts } from '@/lib/utils/posts';
type GraphPost = CollectionEntry<'posts'> | CollectionEntry<'englishPosts'>;
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
type Vector = [number, number, number];
function spherePoint(index: number, count: number): Vector {
  const y = 1 - (2 * index + 1) / count;
  const radius = Math.sqrt(1 - y * y);
  const longitude = index * Math.PI * (3 - Math.sqrt(5)) + 0.57;
  return [Math.cos(longitude) * radius, y, Math.sin(longitude) * radius];
}
function direction(points: Vector[]): Vector {
  const sum: Vector = [0, 0, 0];
  for (const [x, y, z] of points) { sum[0] += x; sum[1] += y; sum[2] += z; }
  const length = Math.hypot(...sum);
  return length > 1e-6 ? [sum[0] / length, sum[1] / length, sum[2] / length] : points[0];
}
// Fit topic territories to their actual article counts on a nearly uniform
// spherical lattice. Run at build time, using the shared post ID across editions.
function spherePositions(posts: GraphPost[]) {
  const fields = new Map<string, GraphPost[]>();
  for (const post of posts) {
    if (!fields.has(post.data.category)) fields.set(post.data.category, []);
    fields.get(post.data.category)!.push(post);
  }
  const topics = [...fields.keys()].sort().map((key, i) => ({
    members: fields.get(key)!, axis: spherePoint(i, fields.size), sites: [] as Vector[],
  }));
  const lattice = posts.map((_, i) => spherePoint(i, posts.length));
  for (let iteration = 0; iteration < 4; iteration++) {
    const proposals = topics.flatMap(topic => {
      topic.sites.length = 0;
      const [x, y, z] = topic.axis;
      return lattice.map(([sx, sy, sz], i) => ({topic, i, score: sx * x + sy * y + sz * z}));
    }).sort((a, b) => b.score - a.score || a.i - b.i);
    const taken = new Uint8Array(lattice.length);
    for (const {topic, i} of proposals) {
      if (taken[i] || topic.sites.length >= topic.members.length) continue;
      taken[i] = 1;
      topic.sites.push(lattice[i]);
    }
    for (const topic of topics) topic.axis = direction(topic.sites);
  }
  const positions = new Map<string, Vector>();
  for (const topic of topics) {
    const [x, y, z] = topic.axis;
    const h = Math.hypot(x, z);
    const bearing = ([px, py, pz]: Vector) => h < 1e-6 ? Math.atan2(pz, px)
      : Math.atan2(py * h - (px * x + pz * z) * y / h, (px * z - pz * x) / h);
    topic.sites.sort((a, b) => bearing(a) - bearing(b));
    topic.members.sort((a, b) => hash(a.data.subcategory) - hash(b.data.subcategory) ||
      hash(a.id) - hash(b.id) || a.id.localeCompare(b.id));
    topic.members.forEach((post, i) => {
      const [sx, sy, sz] = topic.sites[i];
      const dir = direction([[sx * .855 + x * .145, sy * .855 + y * .145, sz * .855 + z * .145]]);
      positions.set(post.id, dir.map(v => Number((v * 1.9).toFixed(5))) as Vector);
    });
  }
  return positions;
}
function graphPostPath(post: GraphPost, en: boolean): string {
  if (post.collection === 'englishPosts') return `/en/posts/${post.data.slug}/`;
  const slug = getPostSlug(post);
  return en ? englishPostPathForSlug(slug) : `/posts/${slug}`;
}
function keywords(post: GraphPost) {
  const source = `${post.data.title} ${post.data.description} ${post.body ?? ''}`
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .toLowerCase();
  const tokens = source.match(/[a-z][a-z0-9-]{3,}|[가-힣]{2,}/g) ?? [];
  return new Set(tokens.filter((token) => !STOP_WORDS.has(token)).slice(0, 240));
}
export async function buildPostGraph(posts: GraphPost[], en = false): Promise<PostGraph> {
  const positions = spherePositions(posts);
  // Keep relationship scores stable across editions. Translated wording changes
  // token overlap even when two articles describe exactly the same subject.
  const originals = en ? await getPublishedPosts() : posts;
  const keywordSets = new Map(originals.map((post) => [post.id, keywords(post)]));
  const nodes = posts.map((post, index): PostGraphNode => {
    const [x, y, z] = positions.get(post.id)!;
    return {
      id: `post-${index}`,
      title: post.data.title,
      href: graphPostPath(post, en),
      category: post.data.category,
      subcategory: post.data.subcategory,
      type: post.data.type,
      tags: post.data.tags,
      x, y, z,
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
        reasons.push('research area');
      }
      if (a.data.category === b.data.category) {
        score += 4;
        reasons.push('category');
      }
      if (a.data.subcategory === b.data.subcategory) {
        score += 3;
        reasons.push('subcategory');
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
