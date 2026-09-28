import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluate, navigate, waitExpression } from './browser-smoke-harness.mjs';

const koPath = '/posts/2026-09-28-soc-00-system-map/';
const enPath = '/en/posts/soc-00-system-map/';
const figureKinds = ['system', 'sample', 'registers', 'w1c', 'workflow'];

// These tests validate the published lesson UI, not the fictional hardware.
export async function checkSocOverviewPage({ cdp, sessionId, width, lang, enter, screen }) {
  const route = lang === 'ko' ? koPath : enPath;
  await waitExpression(cdp, sessionId, `location.pathname === ${JSON.stringify(route)} && document.readyState === 'complete' && document.querySelectorAll('[data-soc-figure]').length === 5`, 'SoC lesson and all five diagrams loaded');
  const content = await evaluate(cdp, sessionId, `(() => {
    const article = document.querySelector('[data-english-article]') || document.querySelector('article');
    if (!article) throw new Error('SoC article missing');
    const figures = [...article.querySelectorAll('[data-soc-figure]')];
    const headingText = h => {
      const clone = h.cloneNode(true);
      clone.querySelectorAll('.heading-link').forEach(link => link.remove());
      return clone.textContent.trim();
    };
    return {
      language: document.documentElement.lang,
      kinds: figures.map(f => f.getAttribute('data-soc-figure')),
      named: figures.every(f => document.getElementById(f.getAttribute('aria-labelledby'))?.textContent.trim()),
      numberedChapters: [...article.querySelectorAll('h2')].filter(h => /^[1-6]\\. /.test(headingText(h))).length,
      reviews: article.querySelectorAll('details[data-soc-review]').length,
      exercises: article.querySelectorAll('details[data-soc-exercise]').length,
      externalFigureMedia: figures.some(f => f.querySelector('img,iframe,video')),
      offsets: ['0x00','0x04','0x08','0x0C','0x10'].every(v => article.textContent.includes(v)),
      rules: ['W1C','drop-new','0x0011','0x0022','32 bytes','2,000 bytes/s'].every(v => article.textContent.includes(v)),
      reviewIds: [...article.querySelectorAll('[data-soc-review]')].map(d => d.dataset.socReview)
    };
  })()`);
  assert.deepEqual(content.kinds, figureKinds);
  assert.equal(content.language, lang === 'ko' ? 'ko-KR' : 'en');
  assert(content.named && content.offsets && content.rules, JSON.stringify(content));
  assert.equal(content.numberedChapters, 6);
  assert.equal(content.reviews, 5);
  assert.equal(content.exercises, 1);
  assert.deepEqual(content.reviewIds, ['1', '2', '3', '4', '5']);
  assert.equal(content.externalFigureMedia, false, 'Diagrams must not depend on external media');

  const themes = [];
  for (const dark of [false, true]) {
    await evaluate(cdp, sessionId, `document.documentElement.classList.toggle('dark', ${dark})`);
    await evaluate(cdp, sessionId, 'scrollTo({top:0,behavior:"instant"})');
    await screen(`soc-${lang}-${width}-${dark ? 'dark' : 'light'}-top`);
    const sourceCards = [];
    for (const sourceKind of ['board', 'datasheet']) {
      await evaluate(cdp, sessionId, `document.querySelector('[data-soc-source="${sourceKind}"]').scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp, sessionId, `(() => { const i=document.querySelector('[data-soc-source="${sourceKind}"] img'); return i && i.complete && i.naturalWidth>500; })()`, `Real ${sourceKind} image loaded`);
      const sourceLayout = await evaluate(cdp, sessionId, `(() => {
        const f=document.querySelector('[data-soc-source="${sourceKind}"]');
        const img=f.querySelector('img'); const r=f.getBoundingClientRect();
        const firstChapter=[...document.querySelectorAll('article h2')].find(h=>h.textContent.trim().startsWith('1.'));
        return {kind:'${sourceKind}',local:new URL(img.currentSrc).origin===location.origin,
          beforeTerms:'${sourceKind}'!=='board'||!!(f.compareDocumentPosition(firstChapter)&Node.DOCUMENT_POSITION_FOLLOWING),
          overflow:document.documentElement.scrollWidth>innerWidth+2 || f.scrollWidth>f.clientWidth+2,
          width:img.naturalWidth,height:img.naturalHeight,alt:img.alt,
          zoom:f.querySelector('[data-soc-zoom]').getAttribute('href')===img.getAttribute('src'),
          license:!!f.querySelector('a[href*="creativecommons.org/licenses/"]'),
          bounds:{x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height,scale:1}};
      })()`);
      assert(sourceLayout.local && sourceLayout.beforeTerms && !sourceLayout.overflow && sourceLayout.zoom && sourceLayout.license && sourceLayout.alt.length>40, JSON.stringify(sourceLayout));
      const {data: sourcePng}=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:sourceLayout.bounds},sessionId);
      fs.writeFileSync(`english-review/soc-${lang}-${width}-${dark?'dark':'light'}-source-${sourceKind}.png`,Buffer.from(sourcePng,'base64'));
      sourceCards.push(sourceLayout);
    }

    const diagrams = [];
    for (const kind of figureKinds) {
      // The site uses content-visibility:auto. Scroll as a reader would, then
      // measure actual descendants, not an offscreen intrinsic-size placeholder.
      await evaluate(cdp, sessionId, `(async () => {
        const f = document.querySelector('[data-soc-figure="${kind}"]');
        f.scrollIntoView({block:'start',behavior:'instant'});
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        scrollTo({top:Math.max(0,scrollY+f.getBoundingClientRect().top-140),behavior:'instant'});
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      })()`);
      await waitExpression(cdp, sessionId, `(() => {
        const f=document.querySelector('[data-soc-figure="${kind}"]');
        const n=f.querySelector('b');const r=n?.getBoundingClientRect();
        return r && r.width>0 && r.height>0 && getComputedStyle(n).visibility==='visible';
      })()`, `SoC ${kind} diagram descendants are laid out`);
      const layout = await evaluate(cdp, sessionId, `(() => {
        const f=document.querySelector('[data-soc-figure="${kind}"]');
        const r=f.getBoundingClientRect();
        const nodes=[...f.querySelectorAll('.soc-node,.soc-steps li,.soc-phase,figcaption')];
        return {
          overflow:document.documentElement.scrollWidth>innerWidth+2,
          diagramOverflow:f.scrollWidth>f.clientWidth+2,
          descendantOverflow:nodes.some(n=>n.scrollWidth>n.clientWidth+2),
          readable:parseFloat(getComputedStyle(f).fontSize)>=16,
          visible:r.width>0 && r.height>0 && r.top<innerHeight && r.bottom>0,
          textCharacters:f.innerText.length,
          colors:{ink:getComputedStyle(f).color,paper:getComputedStyle(f).backgroundColor},
          bounds:{x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height,scale:1}
        };
      })()`);
      assert(!layout.overflow && !layout.diagramOverflow && !layout.descendantOverflow && layout.readable && layout.visible && layout.textCharacters>100, JSON.stringify({kind,...layout}));
      diagrams.push({kind,...layout});
      const { data } = await cdp.send('Page.captureScreenshot', {format:'png',captureBeyondViewport:true,clip:layout.bounds}, sessionId);
      fs.writeFileSync(`english-review/soc-${lang}-${width}-${dark ? 'dark' : 'light'}-${kind}.png`, Buffer.from(data, 'base64'));
    }
    themes.push({dark,diagrams,sourceCards});
  }

  await enter('[data-soc-exercise="fifo"] > summary');
  await waitExpression(cdp, sessionId, `document.querySelector('[data-soc-exercise="fifo"]').open`, 'Native exercise disclosure opens');
  const answer = await evaluate(cdp, sessionId, `document.querySelector('[data-soc-exercise="fifo"]').innerText`);
  assert(answer.includes('COUNT=16') && answer.includes('ERROR.bit0=1'));
  await screen(`soc-${lang}-${width}-exercise`);
  await enter('[data-soc-exercise="fifo"] > summary');
  await waitExpression(cdp, sessionId, `!document.querySelector('[data-soc-exercise="fifo"]').open`, 'Native exercise disclosure closes');
  await enter('[data-soc-review="3"] > summary');
  await waitExpression(cdp, sessionId, `document.querySelector('[data-soc-review="3"]').open`, 'Native W1C review opens');
  await enter('[data-soc-review="3"] > summary');
  await waitExpression(cdp, sessionId, `!document.querySelector('[data-soc-review="3"]').open`, 'Native W1C review closes');

  const archive = lang === 'ko' ? '/posts/' : '/en/posts/';
  await navigate(cdp, sessionId, archive);
  const link = lang === 'ko'
    ? `#robotics-embedded a[href*="2026-09-28-soc-00-system-map"]`
    : `main a[href="${enPath}"]`;
  await enter(link);
  await waitExpression(cdp, sessionId, `location.pathname.replace(/\\/+$/, '') === ${JSON.stringify(route.replace(/\/+$/, ''))} && document.readyState === 'complete' && document.querySelectorAll('[data-soc-figure]').length === 5`, 'Native archive link opens the exact SoC lesson');
  const archiveDestination = await evaluate(cdp, sessionId, 'location.pathname');
  return {width,lang,...content,themes,nativeExercise:true,nativeReview:true,archive:true,archiveDestination};
}
