import { getPublishedPosts, getPostSlug } from '@/lib/utils/posts';
import { postPath } from '@/lib/i18n';
export const GET = async () => new Response(JSON.stringify((await getPublishedPosts('en')).map((post) => ({
  id: getPostSlug(post), url: postPath(post), lang: 'en',
  data: { title: post.data.title, description: post.data.description },
}))), { headers: { 'Content-Type': 'application/json' } });
