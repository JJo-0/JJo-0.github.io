from pathlib import Path
import re
app=Path('spaceship-ui')
p=app/'site/content/about/index-en.md'
p.write_text(re.sub(r' {2,}\n','<br />\n',p.read_text()))
p=app/'src/components/EnglishNewsList.astro'
p.write_text('''---
import NewsFigure from '@/components/post/NewsFigure.astro';
import EnglishPostCard from '@/components/EnglishPostCard.astro';
import { getEnglishPosts, isEnglishNews, pairForEnglish } from '@/lib/english';
import catalogue from '../../site/news-media.json';
const posts = (await getEnglishPosts()).filter(isEnglishNews);
const cards = posts.map((post) => ({
  post,
  media: (Object.keys(catalogue) as Array<keyof typeof catalogue>).find(
    (key) => catalogue[key].slug === pairForEnglish(post.data.slug).koSlug
  ),
}));
---
<div data-english-news-list>
  {cards.map(({post,media},index) => (
    <section class="english-news-item">
      {media && <NewsFigure {media} lang="en" compact thumbnail priority={index===0} />}
      <EnglishPostCard {post} />
    </section>
  ))}
</div>
<style>
.english-news-item{display:grid;grid-template-columns:minmax(0,15rem) minmax(0,1fr);gap:1.75rem;align-items:start;padding:1.8rem 0;border-bottom:1px solid var(--color-border)}
@media(max-width:640px){.english-news-item{grid-template-columns:minmax(0,1fr);gap:.8rem}}
</style>
''')
# Keep the existing media contract unchanged; omit decoration only on the new English home.
p=app/'src/pages/en/index.astro';s=p.read_text()
s,n=re.subn(r'\n          <div class="experience-mouse-frame experience-mouse-frame--world">[\s\S]*?</div>','',s)
assert n==1,n
p.write_text(s)
p=app/'scripts/browser-english-edition.mjs';s=p.read_text()
s=s.replace("&& document.documentElement.lang === 'en'", "&& document.documentElement?.lang === 'en' && document.readyState === 'complete' && Boolean(document.querySelector('[data-english-article]'))")
s=s.replace("location.pathname === '/posts/${pair.koSlug}/'`", "location.pathname === '/posts/${pair.koSlug}/' && document.readyState === 'complete' && Boolean(document.querySelector('article'))`")
a='async function enter(selector){';assert s.count(a)==1
s=s.replace(a,a+'''\n  await waitExpression(cdp,sessionId,`document.readyState === 'complete' && (()=>{const element=document.querySelector(${JSON.stringify(selector)});return Boolean(element) && !element.closest('astro-island')?.hasAttribute('ssr')})()`,'interactive element ready before one native input');''')
s=s.replace("{type:'rawKeyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13}","{type:'keyDown',key:'Enter',code:'Enter',text:'\\r',unmodifiedText:'\\r',windowsVirtualKeyCode:13}")
s=s.replace("await navigate(cdp,sessionId,'/en/news/');await enter", "console.log('english-browser: article/locale/citation/index cases passed');\n  await navigate(cdp,sessionId,'/en/news/');await enter")
p.write_text(s)
