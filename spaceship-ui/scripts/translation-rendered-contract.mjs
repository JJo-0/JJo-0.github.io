import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url),read=(p)=>fs.readFileSync(new URL(p,root),'utf8');
const pairs=JSON.parse(read('site/translations.json')).pairs;
const decode=(s)=>s.replaceAll('&amp;','&').replaceAll('&quot;','"');
function tags(html,name){return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`,'g'))].map((m)=>Object.fromEntries([...m[0].matchAll(/([\w:-]+)="([^"]*)"/g)].map((a)=>[a[1],decode(a[2])])));}
function pathOf(url){return new URL(url,'https://jjo-0.github.io').pathname;}
const site=fs.readdirSync(new URL('dist/',root)).filter((p)=>/^sitemap.*\.xml$/.test(p)).map((p)=>read('dist/'+p)).join('\n');
const englishIndex=JSON.parse(read('dist/en/api/search.json')), koreanIndex=JSON.parse(read('dist/api/search.json'));
const enRss=read('dist/en/rss.xml'),koRss=read('dist/rss.xml');
assert.equal(englishIndex.length,4);assert(englishIndex.every((p)=>p.lang==='en' && p.url.startsWith('/en/posts/')));assert(koreanIndex.every((p)=>!p.url.startsWith('/en/')));
assert(enRss.includes('<language>en</language>'));assert(koRss.includes('<language>ko-KR</language>'));assert(!koRss.includes('/en/posts/'));
for(const pair of pairs) {
 const paths={'ko-KR':`/posts/${pair.koSlug}/`,en:`/en/posts/${pair.enSlug}/`,'x-default':`/posts/${pair.koSlug}/`};
 for(const locale of ['ko-KR','en']) {
  const path=paths[locale],html=read('dist'+path+'index.html');const links=tags(html,'link'),meta=tags(html,'meta');
  assert.equal(pathOf(links.find((l)=>l.rel==='canonical')?.href),path);
  for(const [language,target] of Object.entries(paths)) assert.equal(pathOf(links.find((l)=>l.hreflang===language)?.href),target,`${locale}: missing reciprocal ${language}`);
  assert.equal(meta.find((m)=>m.property==='og:locale')?.content,locale==='en'?'en_US':'ko_KR');
  assert(html.includes(`lang="${locale==='en'?'en':'ko'}"`) || html.includes('lang="ko-KR"'));
  assert(site.includes(path));
  const other=paths[locale==='en'?'ko-KR':'en'];assert(tags(html,'a').some((a)=>pathOf(a.href||'')===other && a.hreflang),`${path}: language link must be crawlable`);
  assert(html.includes(`"inLanguage":"${locale==='en'?'en':'ko'}`));
  if(locale==='en') {assert(enRss.includes(path));assert(read('dist/en/news/index.html').includes(path));assert(!fs.existsSync(new URL(`dist/posts/${pair.enSlug}/index.html`,root)));assert(fs.existsSync(new URL(`dist/og/${pair.enSlug}.png`,root)));}
 }
}
for(const [ko,en] of [['/','/en/'],['/news/','/en/news/'],['/posts/','/en/posts/'],['/about/','/en/about/']]) {
 for(const path of [ko,en]) {const html=read('dist'+path+'index.html'),links=tags(html,'link');assert.equal(pathOf(links.find((l)=>l.hreflang==='en')?.href),en);assert.equal(pathOf(links.find((l)=>l.hreflang==='ko-KR')?.href),ko);}
}
assert(!site.includes('/en/404/'));
console.log('translation-rendered-contract: PASS real English routes, reciprocal hreflang, self-canonicals, sitemap, feeds, search and OG');
