import { getPublishedPosts, getPostSlug } from '@/lib/utils/posts';
import { postPath } from '@/lib/i18n';
export const GET = async () => new Response(JSON.stringify((await getPublishedPosts('ko')).map((post) => ({
  id: getPostSlug(post), url: postPath(post), lang: 'ko',
  data: { title: post.data.title, description: post.data.description },
}))), { headers: { 'Content-Type': 'application/json' } });
