import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getEnglishPosts, englishPostPath } from '@/lib/english';
import { SITE } from '@/config';
export async function GET(context: APIContext) {
  return rss({title:'JJo — English research notes',description:'Full English research explainers with evidence and limitations.',site:context.site || SITE.website,items:(await getEnglishPosts()).map(p=>({title:p.data.title,description:p.data.description,pubDate:p.data.pubDate,link:englishPostPath(p),categories:p.data.tags})),customData:'<language>en</language>'});
}
