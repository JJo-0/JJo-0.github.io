import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Cdp,BASE,attach,evaluate,navigate,viewport,waitExpression,startPreview,startChrome,stopChild,removeProfile} from './browser-smoke-harness.mjs';
const edition=JSON.parse(fs.readFileSync(new URL('../site/news-edition-20261002.json',import.meta.url),'utf8'));
const media=JSON.parse(fs.readFileSync(new URL('../site/news-media.json',import.meta.url),'utf8'));
const out='oct02-review';fs.mkdirSync(out,{recursive:true});let preview,chrome,cdp,sessionId;const rows=[];
const timer=setTimeout(()=>{console.error('oct02 browser timed out');process.exit(1)},180_000);
async function enter(selector){
 await evaluate(cdp,sessionId,`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw new Error('Missing input target');el.scrollIntoView({block:'center',behavior:'instant'});el.focus()})()`);
 await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13},sessionId);
 await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
}
async function shot(name){const {data}=await cdp.send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${out}/${name}.png`,Buffer.from(data,'base64'));}
try{
 preview=await startPreview();chrome=await startChrome();cdp=await Cdp.connect(chrome.url);({sessionId}=await attach(cdp,{normalizeHistoryPath:false}));
 for(const width of [390,1440]){
  await viewport(cdp,sessionId,{width,height:900,mobile:width===390,touch:width===390,reduced:false});
  for(const lang of ['ko','en']){
   await navigate(cdp,sessionId,lang==='ko'?'/news/':'/en/news/');
   const expected=edition.entries.map(e=>lang==='ko'?e.slug:e.enSlug);
   const selector=lang==='ko'?'[data-news-card]':'[data-english-card]';const attr=lang==='ko'?'data-news-card':'data-english-card';
   const actual=await evaluate(cdp,sessionId,`[...document.querySelectorAll(${JSON.stringify(selector)})].map(e=>e.getAttribute(${JSON.stringify(attr)})).filter(s=>${JSON.stringify(expected)}.includes(s))`);
   assert.deepEqual(actual,expected,'Same date editorial order');
   for(const e of edition.entries){
    const path=lang==='ko'?`/posts/${e.slug}/`:`/en/posts/${e.enSlug}/`;
    assert.equal((await fetch(new URL(path,BASE))).status,200);await navigate(cdp,sessionId,path);
    const details=await evaluate(cdp,sessionId,`[...document.querySelectorAll('article details[data-beginner-guide],article details[data-candidate-equation]')].map(el=>el.hasAttribute('data-beginner-guide')?'article [data-beginner-guide] summary':'article [data-candidate-equation="'+el.dataset.candidateEquation+'"] summary')`);
    assert.equal(details.length,3);
    for(const selector of details){await enter(selector);await waitExpression(cdp,sessionId,`document.querySelector(${JSON.stringify(selector)}).closest('details').open`,'native explanation expands');}
    for(const dark of [false,true]){
     await evaluate(cdp,sessionId,`document.documentElement.classList.toggle('dark',${dark})`);
     const state=await evaluate(cdp,sessionId,`({lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth+2,mathErrors:document.querySelectorAll('.katex-error').length,ads:!!document.querySelector('meta[name="google-adsense-account"]'),korean:/[가-힣]/.test(document.querySelector('article').innerText)})`);
     assert.equal(state.lang,lang);assert(!state.overflow&&!state.mathErrors&&!state.ads,JSON.stringify(state));if(lang==='en')assert(!state.korean);
    }
    await evaluate(cdp,sessionId,`document.documentElement.classList.remove('dark')`);
    for(const id of e.mediaIds){
     const selector=`article [data-news-figure="${id}"] img`;
     await evaluate(cdp,sessionId,`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
     const state=await waitExpression(cdp,sessionId,`(()=>{const i=document.querySelector(${JSON.stringify(selector)});if(!i.complete||!i.naturalWidth)return null;return {width:i.naturalWidth,height:i.naturalHeight,src:i.getAttribute('src'),href:i.closest('figure').querySelector('a').getAttribute('href')}})()`,'original image decode');
     assert.equal(state.width,media[id].width);assert.equal(state.height,media[id].height);assert.equal(state.src,media[id].src);assert.equal(state.href,media[id].src);
     if(width===390&&id===e.mediaIds[0])await shot(`${e.key}-${lang}-figure-mobile`);
    }
    if(width===390){await evaluate(cdp,sessionId,`document.querySelector('article [data-candidate-equation]').scrollIntoView({block:'center',behavior:'instant'})`);await shot(`${e.key}-${lang}-explanation-mobile`);}
    const other=lang==='ko'?`/en/posts/${e.enSlug}/`:`/posts/${e.slug}/`;
    assert.equal(await evaluate(cdp,sessionId,`document.querySelector('header a[data-locale-choice="${lang==='ko'?'en':'ko'}"]').getAttribute('href')`),other);
    const history=await cdp.send('Page.getNavigationHistory',{},sessionId);const entry=history.entries[history.currentIndex].id;
    await enter('article a[data-news-citation="1"]');await waitExpression(cdp,sessionId,`location.pathname===${JSON.stringify(path)}&&location.hash==='#news-ref-1'`,'same document citation');
    await cdp.send('Page.navigateToHistoryEntry',{entryId:entry},sessionId);await waitExpression(cdp,sessionId,`location.pathname===${JSON.stringify(path)}&&location.hash===''`,'native Back');
    rows.push({key:e.key,lang,width,themes:2,originals:2,explanations:details.length,citationBack:true});console.log('oct02-browser PASS '+JSON.stringify(rows.at(-1)));
   }
  }
 }
 assert.equal(rows.length,12);fs.writeFileSync(`${out}/browser.json`,JSON.stringify({base:BASE,rows},null,2));
}catch(error){console.error(error);fs.writeFileSync(`${out}/failure.json`,JSON.stringify({error:String(error),rows},null,2));if(cdp&&sessionId)await shot('failure').catch(()=>{});process.exitCode=1;}
finally{cdp?.close();await stopChild(chrome?.child,'SIGKILL');await stopChild(preview,'SIGTERM');removeProfile(chrome?.profile);clearTimeout(timer);process.exit(process.exitCode||0);}
