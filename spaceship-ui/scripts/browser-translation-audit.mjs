import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluate, navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';
export async function auditTranslations(cdp, sessionId) {
 const pairs=JSON.parse(fs.readFileSync(new URL('../site/translations.json',import.meta.url),'utf8')).pairs;
 for(const size of [{width:390,height:844,mobile:true,touch:true,reduced:true},{width:1440,height:1000,reduced:true}]) {
  await viewport(cdp,sessionId,size);await navigate(cdp,sessionId,'/en/news/');
  const listed=await evaluate(cdp,sessionId,`[...document.querySelectorAll('[data-en-news-card] h2 a')].map(x=>new URL(x.href).pathname)`);
  assert.equal(listed.length,pairs.length);
  for(const pair of pairs) {
   const target=`/en/posts/${pair.enSlug}/`;assert(listed.includes(target));await navigate(cdp,sessionId,target);
   await evaluate(cdp,sessionId,`[...document.querySelectorAll('article img')].forEach(x=>{x.loading='eager';})`);
   await waitExpression(cdp,sessionId,`[...document.querySelectorAll('article img')].every(x=>x.complete && x.naturalWidth>0)`,'English source images decode');
   const page=await evaluate(cdp,sessionId,`({lang:document.documentElement.lang,figures:document.querySelectorAll('article [data-news-figure]').length,overflow:document.documentElement.scrollWidth>innerWidth+2,back:[...document.querySelectorAll('[data-language-selector] a')].map(a=>new URL(a.href).pathname),text:document.querySelector('article').textContent.length})`);
   assert.equal(page.lang,'en');assert.equal(page.figures,pair.structure.media.length);assert(!page.overflow,`${target}: overflow ${size.width}`);assert(page.back.includes('/posts/'+pair.koSlug+'/'));assert(page.text>12000,'Full long-form English text required');
   await evaluate(cdp,sessionId,`document.querySelector('[data-language-selector] a').click()`);
   await waitExpression(cdp,sessionId,`location.pathname.replace(/\\/$/,'')===${JSON.stringify('/posts/'+pair.koSlug)}`,'English-to-Korean switch');
  }
 }
 console.log('translation-browser: PASS four complete articles, real source-image decoding and Korean links at 390px/1440px');
}
