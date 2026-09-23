import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';

const route='/posts/2026-09-23-nioh2-electrochemical-dac-news/';
const expectedFigures=['sep23-dac-hero','sep23-dac-ph-cycle','sep23-dac-boundary','sep23-dac-evidence'];
const expectedEquations=['dac-nernst','dac-nickel-redox','dac-energy'];
const out='sep23-review';fs.mkdirSync(out,{recursive:true});
let cdp,sessionId,preview,chrome;
const deadline=setTimeout(()=>{console.error('sep23-browser: FAIL hard timeout');process.exit(1);},180_000);
try {
  preview=await startPreview();chrome=await startChrome();cdp=await Cdp.connect(chrome.url);
  ({sessionId}=await attach(cdp,{normalizeHistoryPath:false}));
  for(const width of [390,1440]) for(const dark of [false,true]) {
    await viewport(cdp,sessionId,{width,height:900,mobile:width<500,dark});
    await navigate(cdp,sessionId,`${BASE}${route}`);
    await waitExpression(cdp,sessionId,`document.readyState==='complete'&&document.fonts.status==='loaded'`,'page and fonts');
    for(const id of expectedFigures){
      await evaluate(cdp,sessionId,`document.querySelector('[data-news-figure="${id}"]').scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp,sessionId,`(()=>{const i=document.querySelector('[data-news-figure="${id}"] img');return i?.complete&&i.naturalWidth>0&&i.naturalHeight>0;})()`,'decoded ${id}');
    }
    const result=await evaluate(cdp,sessionId,`(()=>{
      const figures=[...document.querySelectorAll('[data-news-figure]')];
      const images=figures.map(f=>f.querySelector('img'));
      const horizontal=document.documentElement.scrollWidth-document.documentElement.clientWidth;
      return {
        figures:figures.map(f=>f.dataset.newsFigure),
        imageSizes:images.map(i=>[i.complete,i.naturalWidth,i.naturalHeight]),
        equations:[...document.querySelectorAll('[data-candidate-equation]')].map(e=>e.dataset.candidateEquation),
        katexErrors:document.querySelectorAll('.katex-error').length,
        horizontal,
        title:document.querySelector('h1')?.textContent?.trim(),
        sourceLinks:document.querySelectorAll('[data-news-reference]').length
      };
    })()`);
    assert.deepEqual(result.figures,expectedFigures);
    assert(result.imageSizes.every(([done,w,h])=>done&&w>0&&h>0));
    assert.deepEqual(result.equations,expectedEquations);
    assert.equal(result.katexErrors,0);assert(result.horizontal<=1,`overflow ${result.horizontal}px`);
    assert.equal(result.title,'공기 중 CO₂를 배터리처럼 뽑아냈다');assert.equal(result.sourceLinks,2);
    const first=await evaluate(cdp,sessionId,`(()=>{const d=document.querySelector('[data-candidate-equation]');d.open=true;return d.open&&d.getBoundingClientRect().width<=innerWidth;})()`);
    assert(first);
    const {data}=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},sessionId);
    fs.writeFileSync(`${out}/${width}-${dark?'dark':'light'}.png`,Buffer.from(data,'base64'));
  }
  console.log('sep23-browser: PASS four viewport/theme cases; images decoded, equations rendered, no horizontal overflow');
} finally {
  clearTimeout(deadline);cdp?.close();await stopChild(chrome?.child);await stopChild(preview);if(chrome?.profile) removeProfile(chrome.profile);
}
