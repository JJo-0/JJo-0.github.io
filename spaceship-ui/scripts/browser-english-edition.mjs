import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';
import { checkPowerBankPage } from './power-bank-browser-check.mjs';
const manifest=JSON.parse(fs.readFileSync(new URL('../site/english-edition.json',import.meta.url),'utf8'));
const out='english-review';fs.mkdirSync(out,{recursive:true});
const results=[];const powerBankResults=[];let preview,chrome,cdp,sessionId;
const hardStop=setTimeout(()=>{console.error('English audit timed out');process.exit(1)},180_000);
async function enter(selector){
  await waitExpression(cdp,sessionId,`document.readyState === 'complete' && (()=>{const element=document.querySelector(${JSON.stringify(selector)});return Boolean(element) && !element.closest('astro-island')?.hasAttribute('ssr')})()`,'interactive element ready before one native input');
  await evaluate(cdp,sessionId,`(()=>{const a=document.querySelector(${JSON.stringify(selector)});if(!a)throw new Error('Missing native link');a.scrollIntoView({block:'center',behavior:'instant'});a.focus()})()`);
  await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13},sessionId);
  await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
}
async function screen(name){const {data}=await cdp.send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${out}/${name}.png`,Buffer.from(data,'base64'));}
try{
  preview=await startPreview();chrome=await startChrome();cdp=await Cdp.connect(chrome.url);({sessionId}=await attach(cdp,{normalizeHistoryPath:false}));
  for(const width of [390,1440]){
    await viewport(cdp,sessionId,{width,height:900,mobile:width===390,touch:width===390,reduced:false});
    for(const pair of manifest.pairs){
      const powerBank=pair.key==='lifestyle-power-bank-20260926';
      const visualSelector=powerBank?'[data-pb-visual]':'[data-news-figure]';
      const parentNav=powerBank?'/en/posts/':'/en/news/';
      await navigate(cdp,sessionId,`/posts/${pair.koSlug}/`);
      if(powerBank)powerBankResults.push(await checkPowerBankPage({cdp,sessionId,width,lang:'ko',enter,screen}));
      await enter('header a[data-locale-choice="en"]');
      await waitExpression(cdp,sessionId,`location.pathname === '/en/posts/${pair.enSlug}/' && document.documentElement?.lang === 'en' && document.readyState === 'complete' && Boolean(document.querySelector('[data-english-article]'))`,'KO to exact EN article');
      for(const dark of [false,true]){
        await evaluate(cdp,sessionId,`document.documentElement.classList.toggle('dark',${dark})`);
        const rendered=await evaluate(cdp,sessionId,`(()=>{const article=document.querySelector('[data-english-article]');return {language:document.documentElement.lang,text:article.innerText.length,korean:/[가-힣]/.test(article.innerText),images:article.querySelectorAll('${visualSelector}').length,news:Boolean(document.querySelector('header a[href="${parentNav}"][aria-current="page"]')),overflow:document.documentElement.scrollWidth>innerWidth+2,mathErrors:article.querySelectorAll('.katex-error').length}})()`);
        assert.equal(rendered.language,'en');assert(rendered.text>9000 && !rendered.korean && rendered.news && !rendered.overflow && rendered.images>0 && !rendered.mathErrors,JSON.stringify(rendered));
        if(powerBank)assert.equal(rendered.images,10,'Consumer guide retains all ten explanatory diagrams');
        results.push({width,slug:pair.enSlug,dark,...rendered});
      }
      if(powerBank)powerBankResults.push(await checkPowerBankPage({cdp,sessionId,width,lang:'en',enter,screen}));
      const history=await cdp.send('Page.getNavigationHistory',{},sessionId);const before=history.entries[history.currentIndex].id;
      await enter('article a[data-news-citation="1"]');
      await waitExpression(cdp,sessionId,`location.pathname === '/en/posts/${pair.enSlug}/' && location.hash === '#news-ref-1'`,'native EN citation');
      await cdp.send('Page.navigateToHistoryEntry',{entryId:before},sessionId);
      await waitExpression(cdp,sessionId,`location.pathname === '/en/posts/${pair.enSlug}/' && location.hash === ''`,'native Back');
      await enter('header a[data-locale-choice="ko"]');
      await waitExpression(cdp,sessionId,`location.pathname === '/posts/${pair.koSlug}/' && document.readyState === 'complete' && Boolean(document.querySelector('article'))`,'EN to exact KO article');
    }
    for(const route of ['/en/','/en/research/','/en/about/','/en/news/','/en/posts/','/en/translations/']){
      await navigate(cdp,sessionId,route);
      const result=await evaluate(cdp,sessionId,`({language:document.documentElement.lang,h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth+2,links:[...document.querySelectorAll('header nav a')].map(a=>a.getAttribute('href'))})`);
      assert.equal(result.language,'en');assert.equal(result.h1,1);assert(!result.overflow);assert(result.links.every(h=>h.startsWith('/en/')));
      if(width===390 && ['/en/','/en/news/','/en/about/'].includes(route))await screen('mobile-'+(route.split('/')[2]||'home'));
      if (route === '/en/posts/' || route === '/en/translations/') {
        assert.equal(await evaluate(cdp,sessionId,`document.querySelector('header a[data-locale-choice="ko"]').getAttribute('href')`),'/posts');
        await enter('header a[data-locale-choice="ko"]');
        await waitExpression(cdp,sessionId,`['/posts','/posts/'].includes(location.pathname) && document.readyState === 'complete'`,'KO keeps the Writing archive context');
      }
    }
  }
  console.log('english-browser: article/locale/citation/index cases passed');
  await navigate(cdp,sessionId,'/en/news/');await enter('header button[aria-label="Search"]');
  await waitExpression(cdp,sessionId,`document.activeElement === document.querySelector('[data-search-dialog] input[placeholder]')`,'English search dialog focus');
  await cdp.send('Input.insertText',{text:'electrolyte'},sessionId);
  await waitExpression(cdp,sessionId,`Boolean(document.querySelector('[data-search-dialog] a[href="/en/posts/solid-state-electrolyte-thin-films/"]'))`,'English search result');
  await enter('[data-search-dialog] a[href="/en/posts/solid-state-electrolyte-thin-films/"]');
  await waitExpression(cdp,sessionId,`location.pathname === '/en/posts/solid-state-electrolyte-thin-films/'`,'native English result');
  await navigate(cdp,sessionId,'/');await evaluate(cdp,sessionId,`localStorage.removeItem('jjo-locale')`);
  await cdp.send('Emulation.setLocaleOverride',{locale:'en-US'},sessionId);
  await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:`Object.defineProperty(navigator,'languages',{get:()=>['en-US','en']});Object.defineProperty(navigator,'language',{get:()=>'en-US'});`},sessionId);
  await navigate(cdp,sessionId,'/');await waitExpression(cdp,sessionId,`document.querySelector('[data-language-hint]')?.hidden === false`,'foreign-language preference hint');
  assert.equal(await evaluate(cdp,sessionId,'location.pathname'),'/');
  await enter('[data-language-dismiss]');
  assert.equal(await evaluate(cdp,sessionId,`localStorage.getItem('jjo-locale')`),'ko');
  await navigate(cdp,sessionId,'/en/translations/?from=%2Fposts%2Funknown%2F');
  assert.equal(await evaluate(cdp,sessionId,`Boolean(document.querySelector('[data-requested-translation]:not([hidden])'))`),true);
  const missing=`/en/posts/english-release-missing-${Date.now()}/`;
  const missingResponse=await fetch(new URL(missing,BASE));
  assert.equal(missingResponse.status,404,'Unknown English URL must remain a real HTTP 404');
  await navigate(cdp,sessionId,missing);
  await waitExpression(cdp,sessionId,`document.documentElement.lang === 'en' && document.documentElement.dataset.englishNotFound === 'true'`,'root 404 recovery recognizes the requested English path');
  assert.equal(await evaluate(cdp,sessionId,`document.querySelector('header [data-site-brand]').getAttribute('href')`),'/en/');
  assert.equal(await evaluate(cdp,sessionId,`document.querySelector('header [data-locale-choice="ko"]').getAttribute('href')`),'/posts');
  assert.equal(await evaluate(cdp,sessionId,`[...document.querySelectorAll('header nav a')].every(a=>a.getAttribute('href').startsWith('/en/'))`),true);
  await screen('english-404');
  await enter('header [data-site-brand]');
  await waitExpression(cdp,sessionId,`location.pathname === '/en/' && document.documentElement?.lang === 'en'`,'English 404 returns to English home');
  fs.writeFileSync(`${out}/browser.json`,JSON.stringify({base:BASE,results,powerBankResults,nativeLanguageRoundTrips:manifest.pairs.length*2,nativeCitationBack:manifest.pairs.length*2,archiveSwitches:4,english404:true,search:true,preference:true},null,2));
  console.log('english-browser: PASS '+results.length+' article/theme/viewport cases plus exact language navigation, citations/Back, index pages, search, language preference and real English 404 recovery');
}catch(error){console.error(error);fs.writeFileSync(`${out}/failure.json`,JSON.stringify({error:String(error),results,powerBankResults},null,2));if(cdp&&sessionId)await screen('failure').catch(()=>{});process.exitCode=1;}
finally{cdp?.close();await stopChild(chrome?.child,'SIGKILL');await stopChild(preview,'SIGTERM');removeProfile(chrome?.profile);clearTimeout(hardStop);process.exit(process.exitCode||0);}
