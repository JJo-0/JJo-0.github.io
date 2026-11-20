import { getLocalizedPosts } from './localized-posts';

export async function getTagPaths(en: boolean) {
  const posts = await getLocalizedPosts(en);
  const allTags = Array.from(new Set(posts.flatMap((post) => post.data.tags || [])));

  return allTags.map((tag) => {
    const filteredPosts = posts
      .filter((post) => post.data.tags?.includes(tag))
      .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

    return {
      params: { tag },
      props: { tag, posts: filteredPosts },
    };
  });
}
