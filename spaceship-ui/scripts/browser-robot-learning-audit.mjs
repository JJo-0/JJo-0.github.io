import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluate, navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

export async function auditRobotLearning(cdp, sessionId) {
  for (const width of [320, 390, 1440]) {
    await viewport(cdp, sessionId, { width, height: 900, mobile: width < 500, touch: width < 500, reduced: true });
    await navigate(cdp, sessionId, '/posts/rl-robot-learning-ch01-introduction/');
    await waitExpression(cdp, sessionId, `document.querySelectorAll('.math-display .katex').length === 5`, 'Robot learning equations rendered');
    assert.equal(await evaluate(cdp, sessionId, `document.querySelectorAll('.lecture-slide').length`), 33);
    assert.equal(await evaluate(cdp, sessionId, `document.querySelectorAll('[data-learning-figure]').length`), 3);
    assert.equal(await evaluate(cdp, sessionId, `document.querySelectorAll('.katex-error').length`), 0);
    assert.equal(await evaluate(cdp, sessionId, `document.body.innerText.includes('**')`), false);
    for (let i = 0; i < 3; i++) {
      await evaluate(cdp, sessionId, `document.querySelectorAll('[data-learning-figure]')[${i}].scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp, sessionId, `(() => {const e=document.querySelectorAll('[data-learning-figure] img')[${i}];return e.complete && e.naturalWidth>0 && e.getBoundingClientRect().height>0;})()`, 'Robot learning source image decoded');
      const figure = await evaluate(cdp, sessionId, `(() => {const e=document.querySelectorAll('[data-learning-figure]')[${i}],im=e.querySelector('img'),cap=e.querySelector('figcaption');return {linked:!!im.closest('a'),captionBelow:cap.getBoundingClientRect().top>=im.getBoundingClientRect().bottom-1,credit:!!cap.querySelector('a[href^="https://"]'),wide:document.documentElement.scrollWidth>innerWidth+2};})()`);
      assert.equal(figure.linked, false);
      assert(figure.captionBelow && figure.credit && !figure.wide, 'Inline source image has caption, credit and no page overflow');
    }
    await evaluate(cdp, sessionId, `document.querySelectorAll('.math-display')[1].scrollIntoView({block:'center',behavior:'instant'})`);
    const math = await evaluate(cdp, sessionId, `({overflow:document.documentElement.scrollWidth>innerWidth+2,labels:[...document.querySelectorAll('.math-display')].every(e=>e.getAttribute('aria-label')),mathml:document.querySelectorAll('.math-display math').length})`);
    assert(!math.overflow && math.labels && math.mathml === 5, 'Equations remain accessible without page overflow');
    fs.mkdirSync('citation-audit', { recursive: true });
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, sessionId);
    fs.writeFileSync(`citation-audit/robot-learning-${width}.png`, Buffer.from(shot.data, 'base64'));
    console.log(`robot-learning: PASS ${width}px, 33 slides, 3 decoded source figures, 5 accessible equations`);
  }
}
