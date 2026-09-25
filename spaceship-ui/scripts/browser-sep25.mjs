import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp,BASE,attach,evaluate,navigate,viewport,waitExpression,startPreview,startChrome,stopChild,removeProfile } from './browser-smoke-harness.mjs';
const edition=JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260925.json',import.meta.url),'utf8'));
const media=JSON.parse(fs.readFileSync(new URL('../site/news-media.json',import.meta.url),'utf8'));
fs.mkdirSync('sep25-review',{recursive:true});let preview,chrome,cdp,sessionId;const rows=[];
const timer=setTimeout(()=>{console.error('sep25-browser: timeout');process.exit(1)},180_000);
try{
 preview=await startPreview();chrome=await startChrome();cdp=await Cdp.connect(chrome.url);({sessionId}=await attach(cdp,{normalizeHistoryPath:false}));
 for(const width of [390,1440]){
  await viewport(cdp,sessionId,{width,height:900,mobile:width===390,touch:width===390,reduced:false});
  for(const e of edition.entries)for(const lang of ['ko','en']){
   const route=lang==='ko'?`/posts/${e.slug}/`:`/en/posts/${e.enSlug}/`;
   assert.equal((await fetch(new URL(route,BASE))).status,200);await navigate(cdp,sessionId,route);
   const seen=[];
   for(const id of e.mediaIds){
    const selector=`article [data-news-figure="${id}"] img`;
    await evaluate(cdp,sessionId,`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    const state=await waitExpression(cdp,sessionId,`(()=>{const i=document.querySelector(${JSON.stringify(selector)});if(!i?.complete||!i.naturalWidth)return null;const f=i.closest('figure'),r=i.getBoundingClientRect();return {src:i.getAttribute('src'),width:i.naturalWidth,height:i.naturalHeight,visible:r.width>0&&r.height>0,link:f.querySelector('a').getAttribute('href'),caption:f.querySelector('figcaption')?.innerText}})()`,'original figure decoded');
    assert.equal(state.src,media[id].src);assert.equal(state.link,media[id].src);assert.equal(state.width,media[id].width);assert.equal(state.height,media[id].height);assert(state.visible&&state.caption);
    if(lang==='en')assert(!/[가-힣]/.test(state.caption));
    if(width===390&&id===e.mediaIds[0]){const {data}=await cdp.send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`sep25-review/${e.key}-${lang}-mobile.png`,Buffer.from(data,'base64'));}
    seen.push(id);
   }
   const state=await evaluate(cdp,sessionId,`({lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth+2,errors:document.querySelectorAll('.katex-error').length,ads:!!document.querySelector('meta[name="google-adsense-account"]')})`);
   assert.equal(state.lang,lang);assert(!state.overflow&&!state.errors&&!state.ads);
   // One real keyboard activation; there is no script click or repeated input.
   await evaluate(cdp,sessionId,`const a=document.querySelector('article a[data-news-citation="1"]');a.scrollIntoView({block:'center',behavior:'instant'});a.focus();`);
   await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13},sessionId);
   await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
   await waitExpression(cdp,sessionId,`location.hash==='#news-ref-1' && location.pathname===${JSON.stringify(route)}`,'same-article reference target');
   rows.push({key:e.key,lang,width,originals:seen,nativeCitation:true});console.log('sep25-browser: PASS '+JSON.stringify(rows.at(-1)));
  }
 }
 assert.equal(rows.length,12);fs.writeFileSync('sep25-review/browser.json',JSON.stringify({base:BASE,rows},null,2));
}catch(error){console.error(error);fs.writeFileSync('sep25-review/failure.json',JSON.stringify({error:String(error),rows},null,2));process.exitCode=1;}
finally{cdp?.close();await stopChild(chrome?.child,'SIGKILL');await stopChild(preview,'SIGTERM');removeProfile(chrome?.profile);clearTimeout(timer);process.exit(process.exitCode||0);}
