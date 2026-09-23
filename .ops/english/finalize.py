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
# The existing content/media contract is unchanged. Only the new English
# homepage omits the decorative mouse panel; the Korean homepage is untouched.
p=app/'src/pages/en/index.astro';s=p.read_text()
s,n=re.subn(r'\n          <div class="experience-mouse-frame experience-mouse-frame--world">[\s\S]*?</div>','',s)
assert n==1,n
p.write_text(s)
