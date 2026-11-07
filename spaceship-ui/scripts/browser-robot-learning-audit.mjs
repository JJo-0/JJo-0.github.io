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
    await auditEquationGuides(cdp, sessionId, 1, width);
    console.log(`robot-learning: PASS ${width}px, 33 slides, 3 decoded source figures, 5 accessible equations`);
  }
  for (const width of [320, 390, 1440]) {
    await viewport(cdp, sessionId, { width, height: 900, mobile: width < 500, touch: width < 500, reduced: true });
    await navigate(cdp, sessionId, '/posts/rl-robot-learning-ch02-control-mdp/');
    await waitExpression(cdp, sessionId, `document.querySelectorAll('.math-display .katex').length === 23`, 'Chapter 02 equations rendered');
    const structure = await evaluate(cdp, sessionId, `({slides:[...document.querySelectorAll('[data-lecture-number="2"]')].map(e=>e.dataset.lectureSlide),figures:document.querySelectorAll('[data-learning-figure]').length,errors:document.querySelectorAll('.katex-error').length,labels:[...document.querySelectorAll('.math-display')].every(e=>e.getAttribute('aria-label')),mathml:document.querySelectorAll('.math-display math').length,literal:document.body.innerText.includes('**')})`);
    const expected = Array.from({length:46},(_,i)=>i+1).filter(n=>![2,29,45,46].includes(n)).map(n=>'P'+String(n).padStart(3,'0'));
    assert.deepEqual(structure.slides, expected);
    assert.equal(structure.figures, 5);
    assert.equal(structure.errors, 0);
    assert.equal(structure.mathml, 23);
    assert(structure.labels && !structure.literal);
    const inline = await evaluate(cdp, sessionId, `(() => {const all=[...document.querySelectorAll('.math-inline')], tex=all.map(e=>e.querySelector('annotation')?.textContent), codes=[...document.querySelectorAll('article code')].filter(e=>!e.closest('pre')).map(e=>e.textContent); return {count:all.length,mathml:all.every(e=>e.querySelector('math')),error:tex.includes('e=f(q)-x^*'),jacobian:tex.includes('J^\\\\top e'),badCode:codes.filter(t=>/e=f|J[ᵀ†]|γ|q₁|θ̇/.test(t)),oversize:all.filter(e=>e.getBoundingClientRect().width>innerWidth-30).map(e=>e.querySelector('annotation')?.textContent)};})()`);
    assert(inline.count >= 150 && inline.mathml && inline.error && inline.jacobian, 'Inline error, Jacobian and other notation renders as accessible mathematics');
    assert.deepEqual(inline.badCode, [], 'Mathematics must not fall back to inline code');
    assert.deepEqual(inline.oversize, [], 'Long inline formulas must fit a phone or use a scrollable display');
    // Images are checked by a flat DOM index; figure elements are interspersed with slides.
    const imageCount = await evaluate(cdp, sessionId, `document.querySelectorAll('.lecture-slide img,[data-learning-figure] img').length`);
    assert.equal(imageCount,47);
    for (let i=0;i<imageCount;i++) {
      await evaluate(cdp, sessionId, `document.querySelectorAll('.lecture-slide img,[data-learning-figure] img')[${i}].scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp, sessionId, `(() => {const e=document.querySelectorAll('.lecture-slide img,[data-learning-figure] img')[${i}];return e.complete&&e.naturalWidth>0;})()`, 'Chapter 02 image decoded');
    }
    const geometry = await evaluate(cdp, sessionId, `({overflow:document.documentElement.scrollWidth>innerWidth+2,captions:[...document.querySelectorAll('.lecture-slide')].every(e=>{const im=e.querySelector('img'),cap=e.querySelector('figcaption');return !im.closest('a')&&getComputedStyle(cap).fontSize==='12px'&&cap.getBoundingClientRect().top>=im.getBoundingClientRect().bottom-1;}),series:[...document.querySelectorAll('a')].some(a=>a.href.includes('/posts/rl-robot-learning-ch01-introduction/'))})`);
    assert(!geometry.overflow && geometry.captions && geometry.series, 'Chapter 02 slide-first layout and chapter link');
    for (const [name, selector] of [['ik','[data-lecture-slide="P021"]'],['math','.math-display'],['simulation','[data-learning-figure] img[src$="pendulum-zero.gif"]'],['maze','[data-learning-figure] img[src$="ucl-observation-aliasing.png"]'],['mdp','[data-learning-figure] img[src$="silver-student-chain.png"]'],['articulation','[data-lecture-slide="P007"]'],['joints','[data-lecture-slide="P010"]'],['trajectory','[data-lecture-slide="P024"]'],['inline-ik','.math-inline:has(annotation)']]) {
      await evaluate(cdp,sessionId,`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
      if (name === 'inline-ik') await evaluate(cdp,sessionId,`[...document.querySelectorAll('.math-inline')].find(e=>e.querySelector('annotation')?.textContent==='e=f(q)-x^*').parentElement.scrollIntoView({block:'center',behavior:'instant'})`);
      if (name === 'joints' || name === 'articulation') await evaluate(cdp,sessionId,`document.querySelector(${JSON.stringify(selector)}).nextElementSibling.scrollIntoView({block:'start',behavior:'instant'})`);
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},sessionId);
      fs.writeFileSync(`citation-audit/robot-learning-ch02-${name}-${width}.png`,Buffer.from(shot.data,'base64'));
    }
    await auditEquationGuides(cdp, sessionId, 2, width);
    console.log(`robot-learning-ch02: PASS ${width}px, 42 decoded slides, 5 decoded figures, 23 accessible display equations, ${inline.count} inline equations`);
  }

  for (const width of [320, 390, 1440]) {
    await viewport(cdp, sessionId, {width, height:900, mobile:width<500, touch:width<500, reduced:true});
    await navigate(cdp, sessionId, '/posts/rl-robot-learning-ch03-imitation-learning/');
    await waitExpression(cdp, sessionId, `document.querySelectorAll('.math-display .katex').length === 18`, 'Chapter 03 equations rendered');
    const structure = await evaluate(cdp,sessionId,`({slides:[...document.querySelectorAll('[data-lecture-number="3"]')].map(e=>e.dataset.lectureSlide),figures:document.querySelectorAll('[data-learning-figure]').length,errors:document.querySelectorAll('.katex-error').length,display:document.querySelectorAll('.math-display math').length,inline:document.querySelectorAll('.math-inline math').length,labels:[...document.querySelectorAll('.math-display')].every(e=>e.getAttribute('aria-label')),literal:document.body.innerText.includes('**'),oversize:[...document.querySelectorAll('.math-inline')].filter(e=>e.getBoundingClientRect().width>innerWidth-30).map(e=>e.querySelector('annotation')?.textContent)})`);
    assert.deepEqual(structure.slides,Array.from({length:45},(_,i)=>i+1).filter(n=>![2,32,44,45].includes(n)).map(n=>'P'+String(n).padStart(3,'0')));
    assert.equal(structure.figures,4); assert.equal(structure.errors,0); assert.equal(structure.display,18); assert.equal(structure.inline,218);
    assert(structure.labels&&!structure.literal); assert.deepEqual(structure.oversize,[],'Chapter 03 inline mathematics fits phones');
    const count=await evaluate(cdp,sessionId,`document.querySelectorAll('.lecture-slide img,[data-learning-figure] img').length`);
    assert.equal(count,45);
    for (let i=0;i<count;i++) {
      await evaluate(cdp,sessionId,`document.querySelectorAll('.lecture-slide img,[data-learning-figure] img')[${i}].scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp,sessionId,`(()=>{const e=document.querySelectorAll('.lecture-slide img,[data-learning-figure] img')[${i}];return e.complete&&e.naturalWidth>0;})()`,'Chapter 03 image decoded');
    }
    const geometry=await evaluate(cdp,sessionId,`({overflow:document.documentElement.scrollWidth>innerWidth+2,captions:[...document.querySelectorAll('.lecture-slide')].every(e=>{const im=e.querySelector('img'),cap=e.querySelector('figcaption');return !im.closest('a')&&getComputedStyle(cap).fontSize==='12px'&&cap.getBoundingClientRect().top>=im.getBoundingClientRect().bottom-1;}),credits:[...document.querySelectorAll('[data-learning-figure]')].every(e=>!e.querySelector('img').closest('a')&&e.querySelector('figcaption a[href^="https://"]')),series:[...document.querySelectorAll('a')].some(a=>a.href.includes('/posts/rl-robot-learning-ch02-control-mdp/'))})`);
    assert(!geometry.overflow&&geometry.captions&&geometry.credits&&geometry.series,'Chapter 03 layout, credits and series link');
    for (const [name,selector] of [['bc','[data-lecture-slide="P005"]'],['mixture','[data-lecture-slide="P025"]'],['latent','[data-learning-figure] img[src$="play-lmp-training-inference.png"]'],['elbo','[data-lecture-slide="P040"]'],['aggregation','[data-learning-figure] img[src$="data-aggregation.png"]']]) {
      await evaluate(cdp,sessionId,`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start',behavior:'instant'})`);
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},sessionId);
      fs.writeFileSync(`citation-audit/robot-learning-ch03-${name}-${width}.png`,Buffer.from(shot.data,'base64'));
    }
    await auditEquationGuides(cdp, sessionId, 3, width);
    console.log(`robot-learning-ch03: PASS ${width}px, 41 decoded slides, 4 decoded figures, 18 accessible display equations, ${structure.inline} inline equations`);
  }
  for (const width of [320, 390, 1440]) {
    await viewport(cdp, sessionId, {width, height:900, mobile:width<500, touch:width<500, reduced:true});
    await navigate(cdp, sessionId, '/posts/rl-robot-learning-ch04-value-learning/');
    await waitExpression(cdp, sessionId, `document.querySelectorAll('.math-display .katex').length === 20`, 'Chapter 04 equations rendered');
    const structure = await evaluate(cdp,sessionId,`({slides:[...document.querySelectorAll('[data-lecture-number="4"]')].map(e=>e.dataset.lectureSlide),figures:document.querySelectorAll('[data-learning-figure]').length,errors:document.querySelectorAll('.katex-error').length,display:document.querySelectorAll('.math-display math').length,inline:document.querySelectorAll('.math-inline math').length,labels:[...document.querySelectorAll('.math-display')].every(e=>e.getAttribute('aria-label')),literal:document.body.innerText.includes('**'),oversize:[...document.querySelectorAll('.math-inline')].filter(e=>e.getBoundingClientRect().width>innerWidth-30).map(e=>e.querySelector('annotation')?.textContent)})`);
    assert.deepEqual(structure.slides,Array.from({length:45},(_,i)=>i+1).filter(n=>![44,45].includes(n)).map(n=>'P'+String(n).padStart(3,'0')));
    assert.equal(structure.figures,4); assert.equal(structure.errors,0); assert.equal(structure.display,20); assert.equal(structure.inline,258);
    assert(structure.labels&&!structure.literal); assert.deepEqual(structure.oversize,[],'Chapter 04 inline mathematics fits phones');
    const count=await evaluate(cdp,sessionId,`document.querySelectorAll('.lecture-slide img,[data-learning-figure] img').length`);
    assert.equal(count,47);
    for (let i=0;i<count;i++) {
      await evaluate(cdp,sessionId,`document.querySelectorAll('.lecture-slide img,[data-learning-figure] img')[${i}].scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp,sessionId,`(()=>{const e=document.querySelectorAll('.lecture-slide img,[data-learning-figure] img')[${i}];return e.complete&&e.naturalWidth>0;})()`,'Chapter 04 image decoded');
    }
    const geometry=await evaluate(cdp,sessionId,`({overflow:document.documentElement.scrollWidth>innerWidth+2,captions:[...document.querySelectorAll('.lecture-slide')].every(e=>{const im=e.querySelector('img'),cap=e.querySelector('figcaption');return !im.closest('a')&&getComputedStyle(cap).fontSize==='12px'&&cap.getBoundingClientRect().top>=im.getBoundingClientRect().bottom-1;}),credits:[...document.querySelectorAll('[data-learning-figure]')].every(e=>!e.querySelector('img').closest('a')&&e.querySelector('figcaption a[href^="https://"]')),series:[...document.querySelectorAll('a')].some(a=>a.href.includes('/posts/rl-robot-learning-ch03-imitation-learning/'))})`);
    assert(!geometry.overflow&&geometry.captions&&geometry.credits&&geometry.series,'Chapter 04 layout, credits and series link');
    for (const [name,selector] of [['bellman','[data-lecture-slide="P010"]'],['td','[data-lecture-slide="P021"]'],['network','[data-learning-figure] img[src$="dqn-network.png"]'],['double','[data-lecture-slide="P033"]'],['actor','[data-lecture-slide="P041"]'],['cem','[data-learning-figure] img[src$="cem-search.png"]']]) {
      await evaluate(cdp,sessionId,`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start',behavior:'instant'})`);
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},sessionId);
      fs.writeFileSync(`citation-audit/robot-learning-ch04-${name}-${width}.png`,Buffer.from(shot.data,'base64'));
    }
    await auditEquationGuides(cdp, sessionId, 4, width);
    console.log(`robot-learning-ch04: PASS ${width}px, 43 decoded slides, 4 decoded figures, 20 accessible display equations, ${structure.inline} inline equations`);
  }

  for (const width of [320, 390, 1440]) {
    await viewport(cdp, sessionId, {width, height:900, mobile:width<500, touch:width<500, reduced:true});
    await navigate(cdp, sessionId, '/posts/rl-robot-learning-ch05-policy-gradients/');
    await waitExpression(cdp, sessionId, `document.querySelectorAll('.math-display .katex').length === 24`, 'Chapter 05 equations rendered');
    const structure = await evaluate(cdp,sessionId,`({slides:[...document.querySelectorAll('[data-lecture-number="5"]')].map(e=>e.dataset.lectureSlide),figures:document.querySelectorAll('[data-learning-figure]').length,errors:document.querySelectorAll('.katex-error').length,display:document.querySelectorAll('.math-display math').length,inline:document.querySelectorAll('.math-inline math').length,labels:[...document.querySelectorAll('.math-display')].every(e=>e.getAttribute('aria-label')),literal:document.body.innerText.includes('**'),oversize:[...document.querySelectorAll('.math-inline')].filter(e=>e.getBoundingClientRect().width>innerWidth-30).map(e=>e.querySelector('annotation')?.textContent)})`);
    assert.deepEqual(structure.slides,Array.from({length:36},(_,i)=>i+1).filter(n=>![35,36].includes(n)).map(n=>'P'+String(n).padStart(3,'0')));
    assert.equal(structure.figures,3); assert.equal(structure.errors,0); assert.equal(structure.display,24); assert.equal(structure.inline,217);
    assert(structure.labels&&!structure.literal); assert.deepEqual(structure.oversize,[],'Chapter 05 inline mathematics fits phones');
    const count=await evaluate(cdp,sessionId,`document.querySelectorAll('.lecture-slide img,[data-learning-figure] img').length`);
    assert.equal(count,37);
    for (let i=0;i<count;i++) {
      await evaluate(cdp,sessionId,`document.querySelectorAll('.lecture-slide img,[data-learning-figure] img')[${i}].scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp,sessionId,`(()=>{const e=document.querySelectorAll('.lecture-slide img,[data-learning-figure] img')[${i}];return e.complete&&e.naturalWidth>0;})()`,'Chapter 05 image decoded');
    }
    const geometry=await evaluate(cdp,sessionId,`({overflow:document.documentElement.scrollWidth>innerWidth+2,captions:[...document.querySelectorAll('.lecture-slide')].every(e=>{const im=e.querySelector('img'),cap=e.querySelector('figcaption');return !im.closest('a')&&getComputedStyle(cap).fontSize==='12px'&&cap.getBoundingClientRect().top>=im.getBoundingClientRect().bottom-1;}),credits:[...document.querySelectorAll('[data-learning-figure]')].every(e=>!e.querySelector('img').closest('a')&&e.querySelector('figcaption a[href^="https://"]')),series:[...document.querySelectorAll('a')].some(a=>a.href.includes('/posts/rl-robot-learning-ch04-value-learning/'))})`);
    assert(!geometry.overflow&&geometry.captions&&geometry.credits&&geometry.series,'Chapter 05 layout, credits and series link');
    for (const [name,selector] of [['gradient','[data-lecture-slide="P008"]'],['baseline','[data-lecture-slide="P014"]'],['ppo','[data-learning-figure] img[src$="ppo-clipping.png"]'],['sac','[data-lecture-slide="P031"]'],['reparam','[data-lecture-slide="P032"]']]) {
      await evaluate(cdp,sessionId,`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start',behavior:'instant'})`);
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},sessionId);
      fs.writeFileSync(`citation-audit/robot-learning-ch05-${name}-${width}.png`,Buffer.from(shot.data,'base64'));
    }
    await auditEquationGuides(cdp, sessionId, 5, width);
    console.log(`robot-learning-ch05: PASS ${width}px, 34 decoded slides, 3 decoded figures, 24 accessible display equations, ${structure.inline} inline equations`);
  }

  for (const width of [320, 390, 1440]) {
    await viewport(cdp, sessionId, {width, height:900, mobile:width<500, touch:width<500, reduced:true});
    await navigate(cdp, sessionId, '/posts/rl-robot-learning-ch06-generative-models/');
    await waitExpression(cdp, sessionId, `document.querySelectorAll('.math-display .katex').length === 23`, 'Chapter 06 equations rendered');
    const structure = await evaluate(cdp,sessionId,`({slides:[...document.querySelectorAll('[data-lecture-number="6"]')].map(e=>e.dataset.lectureSlide),figures:document.querySelectorAll('[data-learning-figure]').length,errors:document.querySelectorAll('.katex-error').length,display:document.querySelectorAll('.math-display math').length,inline:document.querySelectorAll('.math-inline math').length,labels:[...document.querySelectorAll('.math-display')].every(e=>e.getAttribute('aria-label')),literal:document.body.innerText.includes('**'),oversize:[...document.querySelectorAll('.math-inline')].filter(e=>e.getBoundingClientRect().width>innerWidth-30).map(e=>e.querySelector('annotation')?.textContent)})`);
    assert.deepEqual(structure.slides,Array.from({length:39},(_,i)=>i+1).filter(n=>![38,39].includes(n)).map(n=>'P'+String(n).padStart(3,'0')));
    assert.equal(structure.figures,3); assert.equal(structure.errors,0); assert.equal(structure.display,23); assert.equal(structure.inline,136);
    assert(structure.labels&&!structure.literal); assert.deepEqual(structure.oversize,[],'Chapter 06 inline mathematics fits phones');
    const count=await evaluate(cdp,sessionId,`document.querySelectorAll('.lecture-slide img,[data-learning-figure] img').length`);
    assert.equal(count,40);
    for (let i=0;i<count;i++) {
      await evaluate(cdp,sessionId,`document.querySelectorAll('.lecture-slide img,[data-learning-figure] img')[${i}].scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp,sessionId,`(()=>{const e=document.querySelectorAll('.lecture-slide img,[data-learning-figure] img')[${i}];return e.complete&&e.naturalWidth>0;})()`,'Chapter 06 image decoded');
    }
    const geometry=await evaluate(cdp,sessionId,`({overflow:document.documentElement.scrollWidth>innerWidth+2,captions:[...document.querySelectorAll('.lecture-slide')].every(e=>{const im=e.querySelector('img'),cap=e.querySelector('figcaption');return !im.closest('a')&&getComputedStyle(cap).fontSize==='12px'&&cap.getBoundingClientRect().top>=im.getBoundingClientRect().bottom-1;}),credits:[...document.querySelectorAll('[data-learning-figure]')].every(e=>!e.querySelector('img').closest('a')&&e.querySelector('figcaption a[href^="https://"]')),series:[...document.querySelectorAll('a')].some(a=>a.href.includes('/posts/rl-robot-learning-ch05-policy-gradients/'))})`);
    assert(!geometry.overflow&&geometry.captions&&geometry.credits&&geometry.series,'Chapter 06 layout, credits and series link');
    for (const [name,selector] of [['vae','[data-lecture-slide="P009"]'],['vq','[data-lecture-slide="P015"]'],['ddim','[data-lecture-slide="P026"]'],['flow','[data-lecture-slide="P034"]'],['numeric','[data-learning-figure] img[src$="flow-integration.png"]']]) {
      await evaluate(cdp,sessionId,`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start',behavior:'instant'})`);
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},sessionId);
      fs.writeFileSync(`citation-audit/robot-learning-ch06-${name}-${width}.png`,Buffer.from(shot.data,'base64'));
    }
    await auditEquationGuides(cdp, sessionId, 6, width);
    console.log(`robot-learning-ch06: PASS ${width}px, 37 decoded slides, 3 decoded figures, 23 accessible display equations, ${structure.inline} inline equations`);
  }

  for (const width of [320, 390, 1440]) {
    await viewport(cdp, sessionId, {width, height:900, mobile:width<500, touch:width<500, reduced:true});
    await navigate(cdp, sessionId, '/posts/rl-robot-learning-ch07-sequence-transformers/');
    await waitExpression(cdp, sessionId, `document.querySelectorAll('.math-display .katex').length === 18`, 'Chapter 07 equations rendered');
    const structure = await evaluate(cdp,sessionId,`({slides:[...document.querySelectorAll('[data-lecture-number="7"]')].map(e=>e.dataset.lectureSlide),figures:document.querySelectorAll('[data-learning-figure]').length,errors:document.querySelectorAll('.katex-error').length,display:document.querySelectorAll('.math-display math').length,inline:document.querySelectorAll('.math-inline math').length,labels:[...document.querySelectorAll('.math-display')].every(e=>e.getAttribute('aria-label')),literal:document.body.innerText.includes('**'),oversize:[...document.querySelectorAll('.math-inline')].filter(e=>e.getBoundingClientRect().width>innerWidth-30).map(e=>e.querySelector('annotation')?.textContent)})`);
    assert.deepEqual(structure.slides,Array.from({length:39},(_,i)=>i+1).filter(n=>![1,38,39].includes(n)).map(n=>'P'+String(n).padStart(3,'0')));
    assert.equal(structure.figures,2); assert.equal(structure.errors,0); assert.equal(structure.display,18); assert.equal(structure.inline,145);
    assert(structure.labels&&!structure.literal); assert.deepEqual(structure.oversize,[],'Chapter 07 inline mathematics fits phones');
    const count=await evaluate(cdp,sessionId,`document.querySelectorAll('.lecture-slide img,[data-learning-figure] img').length`);
    assert.equal(count,38);
    for (let i=0;i<count;i++) {
      await evaluate(cdp,sessionId,`document.querySelectorAll('.lecture-slide img,[data-learning-figure] img')[${i}].scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp,sessionId,`(()=>{const e=document.querySelectorAll('.lecture-slide img,[data-learning-figure] img')[${i}];return e.complete&&e.naturalWidth>0;})()`,'Chapter 07 image decoded');
    }
    const geometry=await evaluate(cdp,sessionId,`({overflow:document.documentElement.scrollWidth>innerWidth+2,captions:[...document.querySelectorAll('.lecture-slide')].every(e=>{const im=e.querySelector('img'),cap=e.querySelector('figcaption');return !im.closest('a')&&getComputedStyle(cap).fontSize==='12px'&&cap.getBoundingClientRect().top>=im.getBoundingClientRect().bottom-1;}),credits:[...document.querySelectorAll('[data-learning-figure]')].every(e=>!e.querySelector('img').closest('a')&&e.querySelector('figcaption a[href^="https://"]')),series:[...document.querySelectorAll('a')].some(a=>a.href.includes('/posts/rl-robot-learning-ch06-generative-models/'))})`);
    assert(!geometry.overflow&&geometry.captions&&geometry.credits&&geometry.series,'Chapter 07 layout, credits and series link');
    for (const [name,selector] of [['attention','[data-lecture-slide="P008"]'],['mask','[data-learning-figure] img[src$="attention-masks.png"]'],['actions','[data-lecture-slide="P030"]'],['ensemble','[data-lecture-slide="P031"]'],['codec','[data-learning-figure] img[src$="dct-action-codec.png"]']]) {
      await evaluate(cdp,sessionId,`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start',behavior:'instant'})`);
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},sessionId);
      fs.writeFileSync(`citation-audit/robot-learning-ch07-${name}-${width}.png`,Buffer.from(shot.data,'base64'));
    }
    await auditEquationGuides(cdp, sessionId, 7, width);
    console.log(`robot-learning-ch07: PASS ${width}px, 36 decoded slides, 2 decoded figures, 18 accessible display equations, ${structure.inline} inline equations`);
  }


  const laterChapters = [
    {chapter: 8, slug: 'world-models', equations: 9, first: 10, last: 53, sample: ['P010', 'P028', 'P046', 'P052']},
    {chapter: 9, slug: 'generalist-policies', equations: 8, first: 1, last: 57, sample: ['P001', 'P024', 'P044', 'P055']},
  ];
  for (const {chapter, slug, equations, first, last, sample} of laterChapters) {
    for (const width of [320, 390, 1440]) {
      await viewport(cdp, sessionId, {width, height:900, mobile:width<500, touch:width<500, reduced:true});
      await navigate(cdp, sessionId, '/posts/rl-robot-learning-ch' + String(chapter).padStart(2, '0') + '-' + slug + '/');
      await waitExpression(cdp, sessionId, "document.querySelectorAll('.math-display math').length === " + equations, 'Lecture equations rendered');
      const selector = '[data-lecture-number="' + chapter + '"]';
      const slides = await evaluate(cdp, sessionId, '[...document.querySelectorAll(' + JSON.stringify(selector) + ')].map(slide => slide.dataset.lectureSlide)');
      assert.deepEqual(slides, Array.from({length:last - first + 1}, (_, i) => 'P' + String(i + first).padStart(3, '0')));
      for (const page of sample) {
        const image = 'document.querySelector(' + JSON.stringify('[data-lecture-slide="' + page + '"] img') + ')';
        await evaluate(cdp, sessionId, image + ".scrollIntoView({block:'center',behavior:'instant'})");
        await waitExpression(cdp, sessionId, image + '.complete && ' + image + '.naturalWidth > 0', 'Lecture slide decoded');
      }
      await auditEquationGuides(cdp, sessionId, chapter, width);
    }
  }

  const finalChapters = [
    {chapter: 10, slug: 'embodied-reasoning', equations: 6},
    {chapter: 11, slug: 'frontiers-open-problems', equations: 4},
  ];
  for (const {chapter, slug, equations} of finalChapters) {
    for (const width of [320, 390, 1440]) {
      await viewport(cdp, sessionId, {width, height:900, mobile:width<500, touch:width<500, reduced:true});
      await navigate(cdp, sessionId, '/posts/rl-robot-learning-ch' + chapter + '-' + slug + '/');
      await waitExpression(cdp, sessionId, "document.querySelectorAll('.math-display math').length === " + equations, 'Final chapter equations rendered');
      const links = await evaluate(cdp, sessionId, "[...document.querySelectorAll('article a')].map(a => a.getAttribute('href'))");
      assert(links.some(href => href?.includes('cvg.ethz.ch/lectures/Robot-Learning/')));
      assert(links.filter(href => href?.includes('youtube.com/watch?')).length >= 10);
      assert(links.filter(href => href?.includes('assets/lectures/week-' + chapter)).length >= 15);
      await auditEquationGuides(cdp, sessionId, chapter, width);
    }
  }

}

// Exercise native disclosure keyboard behavior, then check every expanded guide.
async function auditEquationGuides(cdp, sessionId, chapter, width) {
  const count=[5,23,18,20,24,23,18,9,8,6,4][chapter-1];
  const initial=await evaluate(cdp,sessionId,`(() => {const all=[...document.querySelectorAll('[data-equation-guide]')];return {count:all.length,closed:all.every(e=>!e.open),adjacent:all.every(e=>e.previousElementSibling?.classList.contains('math-display')&&e.previousElementSibling.querySelector('annotation')?.textContent===decodeURIComponent(e.dataset.equationTex))};})()`);
  assert.equal(initial.count,count);assert(initial.closed&&initial.adjacent,'Every equation has its own initially collapsed guide');
  assert(await evaluate(cdp,sessionId,`(() => {const s=document.querySelector('[data-equation-guide] summary');s.scrollIntoView({block:'center',behavior:'instant'});s.focus();return document.activeElement===s;})()`),'Equation summary owns keyboard focus');
  await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'},sessionId);
  await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
  await waitExpression(cdp,sessionId,`document.querySelector('[data-equation-guide]').open`,'Equation guide opens with Enter');
  await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'},sessionId);
  await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
  await waitExpression(cdp,sessionId,`!document.querySelector('[data-equation-guide]').open`,'Equation guide closes with Enter');
  await evaluate(cdp,sessionId,`document.querySelectorAll('[data-equation-guide]').forEach(e=>e.open=true)`);
  const expanded=await evaluate(cdp,sessionId,`(() => {const all=[...document.querySelectorAll('[data-equation-guide]')];return {overflow:document.documentElement.scrollWidth>innerWidth+2,errors:document.querySelectorAll('.katex-error').length,complete:all.every(e=>e.querySelectorAll('dt math').length>=2&&e.querySelectorAll('ol li').length>=2&&e.querySelector('.worked-example')?.textContent.length>30),tooWide:[...document.querySelectorAll('[data-equation-guide] .math-inline')].filter(e=>e.getBoundingClientRect().width>e.closest('.guide-body,summary').clientWidth-8).map(e=>e.querySelector('annotation')?.textContent)};})()`);
  assert(!expanded.overflow&&expanded.errors===0&&expanded.complete,'Expanded guides contain readable mathematics, definitions, steps and examples');
  assert.deepEqual(expanded.tooWide,[],'Guide inline formulas fit the expanded phone content');
  if(chapter===7){
    const notation=await evaluate(cdp,sessionId,`document.querySelector('[data-equation-guide="rl07-e04"]').textContent`);
    assert(notation.includes('숨은 기억 벡터')&&notation.includes('이전·현재'));
  }
  await evaluate(cdp,sessionId,`(() => {document.querySelectorAll('[data-equation-guide]').forEach(e=>e.open=false);const guide=document.querySelector('[data-equation-guide="rl${String(chapter).padStart(2,'0')}-e${chapter===7?'04':'01'}"]');guide.open=true;guide.scrollIntoView({block:'start',behavior:'instant'});})()`);
  const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},sessionId);
  fs.writeFileSync(`citation-audit/robot-learning-ch${String(chapter).padStart(2,'0')}-guide-${width}.png`,Buffer.from(shot.data,'base64'));
  await evaluate(cdp,sessionId,`document.querySelectorAll('[data-equation-guide]').forEach(e=>e.open=false)`);
  console.log(`robot-equation-guides: PASS chapter${chapter} ${width}px, ${count} paired guides, native keyboard toggling and expanded layout`);
}
