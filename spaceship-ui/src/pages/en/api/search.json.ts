import { getEnglishPosts, englishPostPath } from '@/lib/english';
export async function GET() {
  const posts=await getEnglishPosts();
  return new Response(JSON.stringify(posts.map(post=>({id:post.data.slug,href:englishPostPath(post),data:{title:post.data.title,description:post.data.description}}))),{headers:{'Content-Type':'application/json; charset=utf-8'}});
}
