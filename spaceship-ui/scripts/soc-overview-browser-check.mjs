import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluate, navigate, waitExpression } from './browser-smoke-harness.mjs';

const koPath = '/posts/2026-09-28-soc-00-system-map/';
const enPath = '/en/posts/soc-00-system-map/';
const figureKinds = ['system', 'sample', 'registers', 'workflow'];

// These tests validate the published lesson UI, not the fictional hardware.
export async function checkSocOverviewPage({ cdp, sessionId, width, lang, enter, screen }) {
  const route = lang === 'ko' ? koPath : enPath;
  await waitExpression(cdp, sessionId, `location.pathname === ${JSON.stringify(route)} && document.readyState === 'complete' && document.querySelectorAll('[data-soc-figure]').length === 4`, 'SoC lesson and all four diagrams loaded');
  const content = await evaluate(cdp, sessionId, `(() => {
    const article = document.querySelector('[data-english-article]') || document.querySelector('article');
    if (!article) throw new Error('SoC article missing');
    const figures = [...article.querySelectorAll('[data-soc-figure]')];
    return {
      language: document.documentElement.lang,
      kinds: figures.map(f => f.getAttribute('data-soc-figure')),
      named: figures.every(f => document.getElementById(f.getAttribute('aria-labelledby'))?.textContent.trim()),
      numberedChapters: [...article.querySelectorAll('h2')].filter(h => /^[1-6]\\. /.test(h.textContent.trim())).length,
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
    const layout = await evaluate(cdp, sessionId, `(() => {
      const figs = [...document.querySelectorAll('[data-soc-figure]')];
      return {
        overflow: document.documentElement.scrollWidth > innerWidth + 2,
        diagramOverflow: figs.some(f => f.scrollWidth > f.clientWidth + 2),
        readable: figs.every(f => parseFloat(getComputedStyle(f).fontSize) >= 16),
        visible: figs.every(f => f.getBoundingClientRect().width > 0 && f.getBoundingClientRect().height > 0),
        colors: figs.map(f => ({ink:getComputedStyle(f).color,paper:getComputedStyle(f).backgroundColor}))
      };
    })()`);
    assert(!layout.overflow && !layout.diagramOverflow && layout.readable && layout.visible, JSON.stringify(layout));
    themes.push({ dark, ...layout });
    await evaluate(cdp, sessionId, 'scrollTo({top:0,behavior:"instant"})');
    await screen(`soc-${lang}-${width}-${dark ? 'dark' : 'light'}-top`);
    for (const kind of figureKinds) {
      const bounds = await evaluate(cdp, sessionId, `(() => {
        const r = document.querySelector('[data-soc-figure="${kind}"]').getBoundingClientRect();
        return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height,scale:1};
      })()`);
      const { data } = await cdp.send('Page.captureScreenshot', { format:'png', captureBeyondViewport:true, clip:bounds }, sessionId);
      fs.writeFileSync(`english-review/soc-${lang}-${width}-${dark ? 'dark' : 'light'}-${kind}.png`, Buffer.from(data, 'base64'));
    }
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
  await waitExpression(cdp, sessionId, `location.pathname === ${JSON.stringify(route)} && document.readyState === 'complete'`, 'Native archive link opens the SoC lesson');
  return { width, lang, ...content, themes, nativeExercise:true, nativeReview:true, archive:true };
}
