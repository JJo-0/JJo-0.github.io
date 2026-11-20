import { getLocalizedPosts } from '@/lib/localized-posts';
import { englishPostPathForSlug } from '@/lib/locales';
import { getPostSlug } from '@/lib/utils/posts';

export async function GET() {
  const posts = await getLocalizedPosts(true);
  return Response.json(posts.map(post => {
    const href = englishPostPathForSlug(getPostSlug(post));
    return { id: href.split('/').filter(Boolean).at(-1), href, data: { title: post.data.title, description: post.data.description } };
  }));
}
