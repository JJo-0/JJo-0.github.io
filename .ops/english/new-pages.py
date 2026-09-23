from pathlib import Path
import json,re,subprocess,hashlib
app=Path('spaceship-ui')
base='2d94748a983f1aaf84aa274eeda2e92f534ed39a'
old='8b1696e71e011d39ca9809d06ce31eeab1ea21fb'
def write(p,s):
 f=app/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(s)
def source(ref,p):return subprocess.check_output(['git','show',f'{ref}:spaceship-ui/{p}']).decode()
pairs=[]
for pair in json.loads(source(old,'site/translations.json'))['pairs']:
 text=source(old,'site/content/posts/'+pair['enFile']);write('site/content/english/'+pair['enFile'],text)
 row={k:pair[k] for k in ['key','koSlug','enSlug','koFile','enFile']}
 row['sourceSha256']=hashlib.sha256(source(base,'site/content/posts/'+pair['koFile']).encode()).hexdigest()
 row['englishSha256']=hashlib.sha256(text.encode()).hexdigest();row['sourceCommit']=base;row['scope']='full-article';pairs.append(row)
write('site/english-edition.json',json.dumps({'version':1,'goal':'Full English translations of the site, including interactive content; never substitute a summary or silently label Korean text as English.','pairs':pairs},indent=2,ensure_ascii=False)+'\n')
for p in ['site/news-media-en.json','site/content/about/index-en.md','site/assets/assets/posts/news-depth-20260913/sulfur-electron-range-en.svg','site/assets/assets/posts/news-depth-20260913/sulfur-mass-basis-en.svg']:write(p,source(old,p))
write('src/lib/english.ts',r'''import { getCollection, type CollectionEntry } from 'astro:content';
import edition from '../../site/english-edition.json';
export type EnglishPost = CollectionEntry<'englishPosts'>;
export const englishSlug = (post: EnglishPost): string => post.data.slug;
export const englishPostPath = (post: EnglishPost): string => `/en/posts/${post.data.slug}/`;
export function pairForEnglish(slug: string) {
  const pair = edition.pairs.find((item) => item.enSlug === slug);
  if (!pair) throw new Error(`English article is not registered: ${slug}`);
  return pair;
}
export async function getEnglishPosts(): Promise<EnglishPost[]> {
  const posts = (await getCollection('englishPosts')).filter((p) => !p.data.draft && p.data.pubDate <= new Date());
  for (const post of posts) {
    const pair = pairForEnglish(post.data.slug);
    if (pair.key !== post.data.translationKey || post.data.translatedPosts['ko-KR'] !== pair.koSlug) {
      throw new Error(`Translation pair mismatch: ${post.id}`);
    }
  }
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.data.slug.localeCompare(b.data.slug));
}
export const isEnglishNews = (post: EnglishPost) => post.data.tags.some((tag) => tag === 'frontier-one' || tag === 'frontier-candidate');
''')
write('src/lib/locales.ts',r'''import edition from '../../site/english-edition.json';
export const EN_DESCRIPTION = 'Research notes on robotics, artificial intelligence, computer vision, and systems engineering by Jiho Park.';
const fixedPairs: Array<[string, string]> = [
  ['/', '/en/'], ['/research', '/en/research/'], ['/about', '/en/about/'], ['/news', '/en/news/'],
];
export const normalizeLocalePath = (path: string): string => path === '/' ? '/' : path.replace(/\/+$/, '');
/** Only equivalent published content is an SEO alternate. Pending writing is not. */
export function nativeAlternates(path: string): Record<string, string> {
  const key = normalizeLocalePath(path);
  const pairs = [...fixedPairs, ...edition.pairs.map((p): [string, string] => [`/posts/${p.koSlug}/`, `/en/posts/${p.enSlug}/`])];
  const pair = pairs.find((p) => p.some((item) => normalizeLocalePath(item) === key));
  return pair ? { 'ko-KR': pair[0], en: pair[1], 'x-default': pair[0] } : {};
}
export function englishSwitchPath(path: string): string {
  const translated = nativeAlternates(path).en;
  if (translated) return translated;
  return `/en/translations/?from=${encodeURIComponent(path)}`;
}
''')
write('src/components/LanguageHint.astro',r'''---
import { englishSwitchPath } from '@/lib/locales';
interface Props { lang: 'ko' | 'en'; }
const { lang } = Astro.props;
---
{lang === 'ko' && <aside data-language-hint hidden class="language-hint" lang="en" aria-label="Language preference">
  <span>Prefer English?</span> <a href={englishSwitchPath(Astro.url.pathname)} data-locale-choice="en" data-astro-reload>Open the English edition</a>
  <button type="button" data-language-dismiss aria-label="Keep reading in Korean">Keep Korean</button>
</aside>}
<script>
  const readChoice = () => { try { return localStorage.getItem('jjo-locale'); } catch { return null; } };
  const saveChoice = (locale: string) => { try { localStorage.setItem('jjo-locale', locale); } catch { /* Storage is optional. */ } };
  const init = () => {
    const hint = document.querySelector<HTMLElement>('[data-language-hint]');
    if (!hint) return;
    const primary = (navigator.languages?.[0] || navigator.language || '').toLowerCase();
    const choice = readChoice();
    hint.hidden = !(choice === 'en' || (!choice && primary && !primary.startsWith('ko')));
  };
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const choice = target?.closest<HTMLElement>('[data-locale-choice]')?.dataset.localeChoice;
    if (choice === 'en' || choice === 'ko') saveChoice(choice);
    if (target?.closest('[data-language-dismiss]')) { saveChoice('ko'); init(); }
  });
  document.addEventListener('astro:page-load', init);
  init();
</script>
<style>
.language-hint:not([hidden]){display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;padding:.75rem 1rem;margin-bottom:1.5rem;border:1px solid var(--color-border);font-size:.8rem;line-height:1.6}
.language-hint a{text-decoration:underline;text-underline-offset:3px}
.language-hint button{margin-left:auto;padding:.25rem .5rem;border:1px solid var(--color-border);border-radius:.3rem;cursor:pointer}
</style>
''')
write('src/components/EnglishPostCard.astro',r'''---
import type { EnglishPost } from '@/lib/english';
import { englishPostPath } from '@/lib/english';
interface Props { post: EnglishPost; slug?: string; readTime?: string; }
const { post } = Astro.props;
---
<a href={englishPostPath(post)} class="english-post-card" data-english-card={post.data.slug}>
  <time datetime={post.data.pubDate.toISOString()}>{post.data.pubDate.toISOString().slice(0,10)}</time>
  <h3>{post.data.title}</h3><p>{post.data.description}</p>
  <span>Read the full article ↗</span>
</a>
<style>
.english-post-card{display:block;padding:1.5rem 0;border-bottom:1px solid var(--color-border);text-decoration:none;overflow-wrap:anywhere}
.english-post-card time,.english-post-card span{font-size:.75rem;color:var(--color-muted-foreground)}
.english-post-card h3{font-family:var(--font-editorial);font-size:clamp(1.3rem,3vw,1.85rem);line-height:1.25;margin:.6rem 0}
.english-post-card p{font-size:.95rem;line-height:1.75;max-width:52rem;color:var(--color-muted-foreground);margin-bottom:.7rem}
.english-post-card:focus-visible{outline:2px solid var(--color-primary);outline-offset:4px}
</style>
''')
write('src/components/EnglishNewsList.astro',r'''---
import NewsFigure from '@/components/post/NewsFigure.astro';
import EnglishPostCard from '@/components/EnglishPostCard.astro';
import { getEnglishPosts, isEnglishNews, pairForEnglish } from '@/lib/english';
import catalogue from '../../site/news-media.json';
const posts = (await getEnglishPosts()).filter(isEnglishNews);
---
<div data-english-news-list>
{posts.map((post,index) => {
  const koSlug=pairForEnglish(post.data.slug).koSlug;
  const media=(Object.keys(catalogue) as Array<keyof typeof catalogue>).find(key=>catalogue[key].slug===koSlug);
  return <section class="english-news-item">
    {media && <NewsFigure {media} lang="en" compact thumbnail priority={index===0} />}
    <EnglishPostCard {post} />
  </section>;
})}
</div>
<style>
.english-news-item{display:grid;grid-template-columns:minmax(0,15rem) minmax(0,1fr);gap:1.75rem;align-items:start;padding:1.8rem 0;border-bottom:1px solid var(--color-border)}
@media(max-width:640px){.english-news-item{grid-template-columns:minmax(0,1fr);gap:.8rem}}
</style>
''')
write('src/lib/research-en.ts',r'''import { RESEARCH_FOCUS as original } from './research';
const descriptions: Record<string, string> = {
  'robotics-autonomous-systems': 'Implementation and validation notes on ROS2, SLAM, real-world robot learning, industrial communication, and autonomous systems.',
  'vision-pose-human-perception': 'Research connecting 3D human pose, motion forecasting, camera geometry, and human vision.',
  'ml-foundations-evaluation': 'Notes linking mathematics, probability, and optimization to generalization, evaluation metrics, and industrial data analysis.',
  'ai-consciousness-governance': 'Research on AI consciousness, mechanistic interpretability, AI welfare, and governance under uncertainty.',
};
export const RESEARCH_FOCUS = original.map((focus) => ({ ...focus, description: descriptions[focus.id] || focus.description }));
''')
write('src/lib/remark/english-citations.mjs',r'''/** Native citations for the English collection only; never modify Korean sources. */
export default function englishCitations() {
  return (tree, file) => {
    if (!String(file.path || file.history?.[0] || '').replaceAll('\\','/').includes('/content/english/')) return;
    const references = new Map();
    for (const node of tree.children || []) {
      const first=node.type==='paragraph' && node.children?.[0];
      const match=first?.type==='text' && first.value.match(/^\[(\d+)\]\s/);
      if (!match) continue;
      const n=match[1];
      if(references.has(n)) throw new Error(`Duplicate English reference ${n}`);
      references.set(n,node);
      node.data={...node.data,hProperties:{...node.data?.hProperties,id:`news-ref-${n}`,'data-news-reference':n}};
    }
    const skip=new Set([...references.values()]);
    function walk(parent) {
      if(!parent.children || skip.has(parent) || ['link','linkReference','code','inlineCode'].includes(parent.type)) return;
      parent.children=parent.children.flatMap(node=>{
        if(node.type!=='text'){walk(node);return [node];}
        const out=[];let last=0;
        for(const match of node.value.matchAll(/\[(\d+)\]/g)) {
          const n=match[1]; if(!references.has(n)) throw new Error(`Undefined English reference ${n}`);
          if(match.index>last)out.push({type:'text',value:node.value.slice(last,match.index)});
          out.push({type:'link',url:`#news-ref-${n}`,children:[{type:'text',value:match[0]}],data:{hProperties:{'data-news-citation':n,'data-astro-reload':true,ariaLabel:`Go to reference ${n}`}}});
          last=match.index+match[0].length;
        }
        if(last<node.value.length)out.push({type:'text',value:node.value.slice(last)});
        return out.length?out:[node];
      });
    }
    walk(tree);
  };
}
''')
write('src/pages/en/news.astro',r'''---
import Layout from '@/layouts/Layout.astro';
import EnglishNewsList from '@/components/EnglishNewsList.astro';
import { getEnglishPosts, isEnglishNews } from '@/lib/english';
const count=(await getEnglishPosts()).filter(isEnglishNews).length;
---
<Layout lang="en" title="Frontier One — English" description="Full English research explainers on AI, robotics, life sciences, energy and semiconductors, with original evidence and limitations." adsEnabled={false}>
<section class="max-w-5xl">
<header class="border-y border-border py-8">
<p class="text-xs uppercase tracking-widest">Latest &amp; Follow-up · English edition</p>
<h1 class="mt-4 text-4xl sm:text-6xl font-bold" style="font-family:var(--font-editorial)">Frontier One</h1>
<p class="mt-5 max-w-3xl leading-relaxed">New research, explained from first principles. These are full translations, with the original tables, equations, figures, sources and limitations retained.</p>
<p class="mt-4 text-sm">{count} complete English articles. <a href="/en/translations/">Translation coverage</a> · <a href="/en/rss.xml">English RSS</a> · <a href="/news" lang="ko" data-astro-reload>한국어 전체 NEWS</a></p>
</header><EnglishNewsList />
</section>
</Layout>
''')
write('src/pages/en/posts/index.astro',r'''---
import Layout from '@/layouts/Layout.astro';
import EnglishPostCard from '@/components/EnglishPostCard.astro';
import { getEnglishPosts, isEnglishNews } from '@/lib/english';
const posts=(await getEnglishPosts()).filter(p=>!isEnglishNews(p));
---
<Layout lang="en" title="Writing — English" description="English study notes, implementation records, tutorials, and research writing." adsEnabled={false}>
<section class="max-w-5xl"><h1 class="text-4xl sm:text-6xl font-bold" style="font-family:var(--font-editorial)">Writing</h1>
<p class="mt-6 max-w-3xl leading-relaxed">Study notes, tutorials, implementation records, and research writing. Frontier One explainers have their own <a href="/en/news/">News archive</a>.</p>
{posts.length ? posts.map(post=><EnglishPostCard {post} />) : <div class="my-8 border border-border p-6 leading-relaxed"><p>The longer study and interactive series are not translated yet. They remain available in their original language; this page does not substitute NEWS articles for them.</p><p class="mt-4"><a href="/posts" data-astro-reload>Browse the original Korean Writing archive</a> · <a href="/en/translations/">See translation coverage</a></p></div>}
</section>
</Layout>
''')
write('src/pages/en/translations.astro',r'''---
import Layout from '@/layouts/Layout.astro';
import { getPublishedPosts, getPostSlug } from '@/lib/utils/posts';
import { getEnglishPosts, pairForEnglish, englishPostPath } from '@/lib/english';
const originals=(await getPublishedPosts()).sort((a,b)=>b.data.pubDate.valueOf()-a.data.pubDate.valueOf());
const translated=await getEnglishPosts();
const bySource=new Map(translated.map(p=>[pairForEnglish(p.data.slug).koSlug,p]));
const pending=originals.filter(p=>!bySource.has(getPostSlug(p)));
---
<Layout lang="en" title="Translation coverage" description="Availability of complete English translations and the original Korean articles still awaiting translation." adsEnabled={false}>
<section class="max-w-5xl"><h1 class="text-4xl sm:text-5xl font-bold" style="font-family:var(--font-editorial)">Translation coverage</h1>
<p class="mt-5 max-w-3xl leading-relaxed">The goal is a complete English edition, including long-form study notes and interactive content. A translation is counted only when the full article is available—not when its title or summary alone has been translated.</p>
<p class="my-5 font-semibold" data-translation-count data-translated={translated.length} data-originals={originals.length}>{translated.length} of {originals.length} published articles available in English; {pending.length} awaiting full translation.</p>
<aside data-requested-translation hidden class="my-6 border border-border p-4" aria-live="polite"></aside>
<h2 class="mt-8 text-2xl font-semibold">Complete English articles</h2>
<ul class="mt-4 space-y-3">{translated.map(post=><li><a href={englishPostPath(post)}>{post.data.title}</a> · <a href={`/posts/${pairForEnglish(post.data.slug).koSlug}/`} data-astro-reload lang="ko">한국어 원문</a></li>)}</ul>
<h2 class="mt-10 text-2xl font-semibold">Awaiting translation</h2><p class="mt-3 text-sm">Titles below are the original Korean titles. These links open Korean articles, not English summaries.</p>
<ul class="mt-4 space-y-3">{pending.map(post=><li data-pending-translation><a href={`/posts/${getPostSlug(post)}/`} data-original-path={`/posts/${getPostSlug(post)}/`} lang="ko" data-astro-reload>{post.data.title}</a> <span class="text-xs">— Korean original</span></li>)}</ul>
</section>
<script>
const showRequested = () => {
  const notice=document.querySelector<HTMLElement>('[data-requested-translation]');
  const requested=new URLSearchParams(location.search).get('from');
  if(!notice || !requested) return;
  const normalize=(value:string)=>value.replace(/\/+$/,'');
  const original=[...document.querySelectorAll<HTMLAnchorElement>('[data-original-path]')].find(a=>normalize(a.dataset.originalPath||'')===normalize(requested));
  notice.replaceChildren();
  if(original){notice.append(document.createTextNode('This article has not been translated yet: '));notice.append(original.cloneNode(true));}
  else {notice.textContent='Use the coverage list to find an available English translation or return to the original edition.';}
  notice.hidden=false;
};
document.addEventListener('astro:page-load',showRequested);showRequested();
</script>
''')
write('src/pages/en/api/search.json.ts',r'''import { getEnglishPosts, englishPostPath } from '@/lib/english';
export async function GET() {
  const posts=await getEnglishPosts();
  return new Response(JSON.stringify(posts.map(post=>({id:post.data.slug,href:englishPostPath(post),data:{title:post.data.title,description:post.data.description}}))),{headers:{'Content-Type':'application/json; charset=utf-8'}});
}
''')
write('src/pages/en/rss.xml.ts',r'''import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getEnglishPosts, englishPostPath } from '@/lib/english';
import { SITE } from '@/config';
export async function GET(context: APIContext) {
  return rss({title:'JJo — English research notes',description:'Full English research explainers with evidence and limitations.',site:context.site || SITE.website,items:(await getEnglishPosts()).map(p=>({title:p.data.title,description:p.data.description,pubDate:p.data.pubDate,link:englishPostPath(p),categories:p.data.tags})),customData:'<language>en</language>'});
}
''')
write('src/pages/en/404.astro',r'''---
import Layout from '@/layouts/Layout.astro';
---
<Layout lang="en" title="Page not found" noindex adsEnabled={false}><h1 class="text-4xl font-bold">Page not found</h1><p class="my-6">This English page is not available. Check <a href="/en/translations/">translation coverage</a> or return to the <a href="/en/">English home</a>.</p></Layout>
''')
write('src/pages/en/posts/[...slug]/index.astro',r'''---
import { render } from 'astro:content';
import Layout from '@/layouts/Layout.astro';
import TableOfContents from '@/components/TableOfContents.svelte';
import SocialShare from '@/components/SocialShare.svelte';
import Comments from '@/components/Comments.svelte';
import { getEnglishPosts, englishPostPath, isEnglishNews, pairForEnglish } from '@/lib/english';
import type { EnglishPost } from '@/lib/english';
import { getBlogPostingSchema, getBreadcrumbSchema } from '@/lib/schemas';
export async function getStaticPaths(){return (await getEnglishPosts()).map(post=>({params:{slug:post.data.slug},props:{post}}));}
interface Props { post: EnglishPost; }
const {post}=Astro.props;
const {Content,headings}=await render(post);
const path=englishPostPath(post), pair=pairForEnglish(post.data.slug), url=new URL(path,Astro.site).href;
const parent=isEnglishNews(post)?'News':'Writing', parentPath=isEnglishNews(post)?'/en/news/':'/en/posts/';
const schema=[getBlogPostingSchema({title:post.data.title,description:post.data.description,pubDate:post.data.pubDate,updatedDate:post.data.updatedDate,url,lang:'en',tags:post.data.tags,image:new URL(`/og/${pair.koSlug}.png`,Astro.site).href}),getBreadcrumbSchema([{name:parent,url:new URL(parentPath,Astro.site).href},{name:post.data.title,url}])];
const fieldNotice=post.data.category==='health-lifestyle'?'General research information, not diagnosis, treatment, or individual medical advice.':post.data.category==='finance-industry'?'Research and industry analysis, not investment advice. Laboratory results and product performance must be distinguished.':'Methods and experiments apply to the stated conditions and need independent validation before deployment.';
---
<Layout lang="en" title={post.data.title} description={post.data.description} ogType="article" ogImage={`/og/${pair.koSlug}.png`} {schema} adsEnabled={false}>
<nav aria-label="Breadcrumb"><a href="/en/">Home</a> / <a href={parentPath}>{parent}</a></nav>
<div class="article-layout lg:flex lg:gap-12" data-post-page-slug={post.data.slug}>
<div class="flex-1 min-w-0"><header class="english-article-header">
<p><time datetime={post.data.pubDate.toISOString()}>{post.data.pubDate.toISOString().slice(0,10)}</time>{post.data.updatedDate && <> · Translation updated <time datetime={post.data.updatedDate.toISOString()}>{post.data.updatedDate.toISOString().slice(0,10)}</time></>}</p>
<h1>{post.data.title}</h1><p class="english-deck">{post.data.description}</p>
<a href={`/posts/${pair.koSlug}/`} lang="ko" hreflang="ko-KR" data-locale-choice="ko" data-astro-reload>한국어 원문</a>
</header>
<aside class="english-notice"><strong>Before using this article</strong><p>Personal research and learning notes. Read source dates and test conditions alongside the reported results. {fieldNotice}</p></aside>
<article class="article-prose prose max-w-none mt-12 mb-16" data-english-article><Content /></article>
<aside><a href={parentPath}>Explore more English {parent.toLowerCase()}</a> · <a href="/en/rss.xml">English RSS</a></aside>
<SocialShare client:visible {url} />{post.data.showComments && <Comments client:visible lang="en" />}
</div><div class="hidden lg:block w-52 flex-shrink-0"><TableOfContents client:idle {headings} /></div></div>
<script>import '@/scripts/code-block-runtime.js';</script>
</Layout>
<style is:global>
.english-article-header{border-top:1px solid var(--color-border);padding-top:2.5rem;margin-top:1.5rem}
.english-article-header h1{font-family:var(--font-editorial);font-size:clamp(2.2rem,5vw,3.7rem);font-weight:700;line-height:1.08;max-width:54rem;margin:1rem 0;overflow-wrap:anywhere}
.english-deck{font-size:1.2rem;line-height:1.65;max-width:49rem;margin-bottom:1.5rem;color:var(--color-muted-foreground)}
.english-notice{max-width:49rem;padding:1.2rem;border:1px solid var(--color-border);border-radius:.6rem;line-height:1.8}
html[lang="en"] .article-prose{max-width:49rem;line-height:1.9;overflow-wrap:break-word}
html[lang="en"] .article-prose h2,html[lang="en"] .article-prose h3{line-height:1.3;word-break:normal}
html[lang="en"] [data-news-reference]{scroll-margin-top:7rem}
</style>
''')
# Translate the current profile and research layouts rather than pairing unrelated index pages.
s=source(base,'src/pages/about.astro').replace("getEntry('about', 'index')","getEntry('about', 'index-en')").replace('`안녕하세요, ${SITE.author}입니다.`',"`Hello, I'm ${SITE.author}.`")
s=s.replace('  title="About"','  title="About"\n  lang="en"').replace('description={`${SITE.author} — AI, 로보틱스, 컴퓨터 비전과 자동화 시스템을 연구하고 기록합니다.`}','description="Jiho Park researches AI, robotics, computer vision, and automation systems."')
s=s.replace("'/about'","'/en/about/'").replace('<Breadcrumbs items=','<Breadcrumbs homeHref="/en/" items=');write('src/pages/en/about.astro',s)
s=source(base,'src/pages/index.astro').replace("import PostCard from '@/components/PostCard.svelte';","import PostCard from '@/components/EnglishPostCard.astro';").replace("import { getPublishedPosts, getPostSlug } from '@/lib/utils/posts';","import { getEnglishPosts as getPublishedPosts, englishSlug as getPostSlug } from '@/lib/english';").replace("from '@/lib/research'","from '@/lib/research-en'")
s=s.replace('<Layout markdownAlternate="/index.md">','<Layout lang="en" description="Robotics, AI, vision, and research engineering by Jiho Park." adsEnabled={false}>')
s=s.replace('사람과 함께 일하는 로봇을 위해 perception, system integration, learning을 연결하고\n            구현과 실험으로 검증합니다. {SITE.homeHeroDescription}','I connect perception, system integration, and learning for robots that work with people,\n            and validate those connections through implementation and experiments.')
s=s.replace('성균관대학교 · Control and Robotics Lab','Sungkyunkwan University · Control and Robotics Lab').replace('한국생산기술연구원','Korea Institute of Industrial Technology')
s=s.replace('아래로 이동하면 연구 지도가 각 연구축에 맞춰 갱신됩니다. 장식이 아니라 공개 연구\n              분류와 실제 Writing을 연결하는 탐색 도구입니다.','As you scroll, the research map follows each line of inquiry. It connects public\n              research categories with the writing available in this English edition.')
s=s.replace('href="/research"','href="/en/research/"').replace('href="/posts"','href="/en/posts/"').replace('href={`/research#${focus.id}`}','href={`/en/research/#${focus.id}`}').replace('Latest Writing','Latest English Research').replace('Archive ↗','English NEWS ↗').replace('<a href="/en/posts/" class="experience-section-link">English NEWS','<a href="/en/news/" class="experience-section-link">English NEWS')
s=s.replace('<section class="experience-section" aria-labelledby="latest-heading" data-reveal>','<p class="mt-10 text-sm leading-relaxed">Full-article translations are being added across the archive. <a href="/en/translations/">See translation coverage</a>; untranslated articles remain available in Korean.</p>\n    <section class="experience-section" aria-labelledby="latest-heading" data-reveal>')
s=re.sub(r'\n  <script>[\s\S]*?</script>\n</Layout>','\n</Layout>',s);write('src/pages/en/index.astro',s)
s=source(base,'src/pages/research.astro').replace("from '@/lib/research'","from '@/lib/research-en'").replace("import { getPublishedPosts, getPostSlug } from '@/lib/utils/posts';","import { getEnglishPosts as getPublishedPosts, englishSlug as getPostSlug } from '@/lib/english';")
s=s.replace('  title="Research"','  title="Research"\n  lang="en"\n  adsEnabled={false}').replace('description="Park JiHo의 로보틱스, AI, 컴퓨터 비전 연구·엔지니어링 주제와 공개 기술 기록을 정리합니다."','description="Research and engineering topics in robotics, AI, and computer vision, with public technical notes by Jiho Park."')
s=s.replace("new URL('/research'","new URL('/en/research/'").replace('<Breadcrumbs items=','<Breadcrumbs homeHref="/en/" items=').replace("href: '/research'","href: '/en/research/'")
s=s.replace('로보틱스·AI·컴퓨터 비전에서 공부하고 실험한 내용을 공개 가능한 기술 글과 연구 노트로\n              연결합니다. 왼쪽 지도는 장식이 아니라 현재 읽고 있는 연구축과 같은 상태를 공유합니다.','I connect studies and experiments in robotics, AI, and computer vision with public technical\n              writing and research notes. The map tracks the line of inquiry you are reading.')
s=s.replace('href={`/posts/${slug}`}','href={`/en/posts/${slug}/`}').replace('관련 공개 기록을 정리하고 있습니다.','English translations of these research records are being prepared. The original records remain available in the Korean edition.').replace('전체 학습·구현·리서치 기록은 Writing에서 분야별로 탐색할 수 있습니다.','Explore study, implementation, and research records by subject in Writing.').replace('대분류, 콘텐츠 형식, 세부 태그와 시리즈를 분리해 연구 대표 글과 전체 기록을 서로 다른\n            기준으로 관리합니다.','Categories, content types, detailed tags, and series separate selected research evidence\n            from the complete archive. Translation coverage identifies what is available in English.').replace('href="/posts"','href="/en/posts/"');write('src/pages/en/research.astro',s)
write('docs/operations/ENGLISH_EDITION_RELEASE.md','# English edition integration\n\nSource translations: PR #113 at '+old+'. Current Korean/mobile base: '+base+'.\n\nFull-site full-article English translation remains the goal. This release provides four full NEWS articles and translated Home, Research and About. Writing series, policy pages and other articles remain pending, explicitly identified by the coverage page. Titles or summaries alone are not translations. Korean original prose, assets, URLs and the separate NEWS-depth work in #113 are preserved. No translation proxy, geolocation, forced redirect, new paid service or advertising-account change.\n\nRecord exact tested/deployed SHAs and actual browser results; build success is not deployment success.\n')
