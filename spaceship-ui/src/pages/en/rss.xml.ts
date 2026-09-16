import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '@/config';
import { getPublishedPosts } from '@/lib/utils/posts';
import { postPath } from '@/lib/i18n';
export async function GET(context: APIContext) {
  const posts = (await getPublishedPosts('en')).sort((a,b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  return rss({ title: 'JJo — English research notes', description: 'Evidence-led research explainers in English.', site: context.site || SITE.website,
    items: posts.map((post) => ({title:post.data.title, pubDate:post.data.pubDate, description:post.data.description, link:postPath(post), categories:post.data.tags})),
    customData: '<language>en</language>',
  });
}
