import { getLocalizedPosts } from '@/lib/localized-posts';
import { buildPostGraph, type PostGraph } from './post-graph';

// Home, Research and the static JSON endpoint share one deterministic ordering.
// Do not memoize development content across edits.
const cache = new Map<boolean, Promise<PostGraph>>();
export function getWritingGraph(en: boolean): Promise<PostGraph> {
  const build = async () => {
    const posts = (await getLocalizedPosts(en)).sort(
      (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id)
    );
    return buildPostGraph(posts, en);
  };
  if (import.meta.env.DEV) return build();
  let pending = cache.get(en);
  if (!pending) {
    pending = build();
    cache.set(en, pending);
    void pending.catch(() => cache.delete(en));
  }
  return pending;
}
