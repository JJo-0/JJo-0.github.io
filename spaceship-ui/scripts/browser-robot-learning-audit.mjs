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
  for (const width of [320, 390, 1440]) {
    await viewport(cdp, sessionId, { width, height: 900, mobile: width < 500, touch: width < 500, reduced: true });
    await navigate(cdp, sessionId, '/posts/rl-robot-learning-ch02-control-mdp/');
    await waitExpression(cdp, sessionId, `document.querySelectorAll('.math-display .katex').length === 20`, 'Chapter 02 equations rendered');
    const structure = await evaluate(cdp, sessionId, `({slides:[...document.querySelectorAll('[data-lecture-number="2"]')].map(e=>e.dataset.lectureSlide),figures:document.querySelectorAll('[data-learning-figure]').length,errors:document.querySelectorAll('.katex-error').length,labels:[...document.querySelectorAll('.math-display')].every(e=>e.getAttribute('aria-label')),mathml:document.querySelectorAll('.math-display math').length,literal:document.body.innerText.includes('**')})`);
    const expected = Array.from({length:46},(_,i)=>i+1).filter(n=>![2,29,45,46].includes(n)).map(n=>'P'+String(n).padStart(3,'0'));
    assert.deepEqual(structure.slides, expected);
    assert.equal(structure.figures, 5);
    assert.equal(structure.errors, 0);
    assert.equal(structure.mathml, 20);
    assert(structure.labels && !structure.literal);
    // Images are checked by a flat DOM index; figure elements are interspersed with slides.
    const imageCount = await evaluate(cdp, sessionId, `document.querySelectorAll('.lecture-slide img,[data-learning-figure] img').length`);
    assert.equal(imageCount,47);
    for (let i=0;i<imageCount;i++) {
      await evaluate(cdp, sessionId, `document.querySelectorAll('.lecture-slide img,[data-learning-figure] img')[${i}].scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp, sessionId, `(() => {const e=document.querySelectorAll('.lecture-slide img,[data-learning-figure] img')[${i}];return e.complete&&e.naturalWidth>0;})()`, 'Chapter 02 image decoded');
    }
    const geometry = await evaluate(cdp, sessionId, `({overflow:document.documentElement.scrollWidth>innerWidth+2,captions:[...document.querySelectorAll('.lecture-slide')].every(e=>{const im=e.querySelector('img'),cap=e.querySelector('figcaption');return !im.closest('a')&&getComputedStyle(cap).fontSize==='12px'&&cap.getBoundingClientRect().top>=im.getBoundingClientRect().bottom-1;}),series:[...document.querySelectorAll('a')].some(a=>a.href.includes('/posts/rl-robot-learning-ch01-introduction/'))})`);
    assert(!geometry.overflow && geometry.captions && geometry.series, 'Chapter 02 slide-first layout and chapter link');
    for (const [name, selector] of [['ik','[data-lecture-slide="P021"]'],['math','.math-display'],['simulation','[data-learning-figure] img[src$="pendulum-zero.gif"]'],['maze','[data-learning-figure] img[src$="ucl-observation-aliasing.png"]'],['mdp','[data-learning-figure] img[src$="silver-student-chain.png"]']]) {
      await evaluate(cdp,sessionId,`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},sessionId);
      fs.writeFileSync(`citation-audit/robot-learning-ch02-${name}-${width}.png`,Buffer.from(shot.data,'base64'));
    }
    console.log(`robot-learning-ch02: PASS ${width}px, 42 decoded slides, 5 decoded figures, 20 accessible equations`);
  }

}
