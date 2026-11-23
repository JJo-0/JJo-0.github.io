import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { startPreview, startChrome, Cdp, attach, stopChild, removeProfile, evaluate, navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

const out = process.env.JJO_SELF_IMPROVING_ARTIFACTS || path.join(os.tmpdir(), 'jjo-self-improving');
fs.mkdirSync(out, { recursive: true });
const chapters = [
  { number: 1, math: 38, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-01-overview', previous: null, next: 'self-improving-ai-02-learning-targets' },
  { number: 2, math: 72, figures: 9, primarySlides: 5, timingRows: null, slug: 'self-improving-ai-02-learning-targets', previous: 'self-improving-ai-01-overview', next: 'self-improving-ai-03-self-correction-to-rl' },
  { number: 3, math: 31, figures: 9, primarySlides: 5, timingRows: null, slug: 'self-improving-ai-03-self-correction-to-rl', previous: 'self-improving-ai-02-learning-targets', next: 'self-improving-ai-04-sparse-rewards-and-shaping' },
  { number: 4, math: 26, figures: 9, primarySlides: 5, timingRows: null, slug: 'self-improving-ai-04-sparse-rewards-and-shaping', previous: 'self-improving-ai-03-self-correction-to-rl', next: 'self-improving-ai-05-reward-design-to-ai-feedback' },
  { number: 5, math: 26, figures: 9, primarySlides: 5, timingRows: null, slug: 'self-improving-ai-05-reward-design-to-ai-feedback', previous: 'self-improving-ai-04-sparse-rewards-and-shaping', next: 'self-improving-ai-06-self-evaluation-and-entropy' },
  { number: 6, math: 20, figures: 9, primarySlides: 5, timingRows: null, slug: 'self-improving-ai-06-self-evaluation-and-entropy', previous: 'self-improving-ai-05-reward-design-to-ai-feedback', next: 'self-improving-ai-07-unsupervised-rlvr-and-test-time-training' },
  { number: 7, math: 22, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-07-unsupervised-rlvr-and-test-time-training', previous: 'self-improving-ai-06-self-evaluation-and-entropy', next: 'self-improving-ai-08-entropy-estimation-and-gradients' },
  { number: 8, math: 32, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-08-entropy-estimation-and-gradients', previous: 'self-improving-ai-07-unsupervised-rlvr-and-test-time-training', next: 'self-improving-ai-09-entropy-paths-and-self-generated-inputs' },
  { number: 9, math: 31, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-09-entropy-paths-and-self-generated-inputs', previous: 'self-improving-ai-08-entropy-estimation-and-gradients', next: 'self-improving-ai-10-self-play-and-external-feedback' },
  { number: 10, math: 18, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-10-self-play-and-external-feedback', previous: 'self-improving-ai-09-entropy-paths-and-self-generated-inputs', next: 'self-improving-ai-11-automated-post-training' },
  { number: 11, math: 16, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-11-automated-post-training', previous: 'self-improving-ai-10-self-play-and-external-feedback', next: 'self-improving-ai-12-weak-to-strong-generalization' },
  { number: 12, math: 12, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-12-weak-to-strong-generalization', previous: 'self-improving-ai-11-automated-post-training', next: 'self-improving-ai-13-agent-harness-and-system-improvement' },
  { number: 13, math: 8, figures: 6, primarySlides: 2, timingRows: 2, slug: 'self-improving-ai-13-agent-harness-and-system-improvement', previous: 'self-improving-ai-12-weak-to-strong-generalization', next: 'self-improving-ai-14-proposer-solver-verifier' },
  { number: 14, math: 17, figures: 12, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-14-proposer-solver-verifier', previous: 'self-improving-ai-13-agent-harness-and-system-improvement', next: 'self-improving-ai-15-harness-optimization-and-evaluation' },
  { number: 15, math: 18, figures: 12, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-15-harness-optimization-and-evaluation', previous: 'self-improving-ai-14-proposer-solver-verifier', next: 'self-improving-ai-16-prompt-memory-code-evolution' },
  { number: 16, math: 16, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-16-prompt-memory-code-evolution', previous: 'self-improving-ai-15-harness-optimization-and-evaluation', next: 'self-improving-ai-17-archive-dspy-experience' },
  { number: 17, math: 10, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-17-archive-dspy-experience', previous: 'self-improving-ai-16-prompt-memory-code-evolution', next: 'self-improving-ai-18-better-together-and-evolving-goals' },
  { number: 18, math: 11, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-18-better-together-and-evolving-goals', previous: 'self-improving-ai-17-archive-dspy-experience', next: 'self-improving-ai-19-test-time-training-and-forgetting' },
  { number: 19, math: 20, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-19-test-time-training-and-forgetting', previous: 'self-improving-ai-18-better-together-and-evolving-goals', next: 'self-improving-ai-20-retaining-skills-and-improving-the-improver' },
  { number: 20, math: 13, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-20-retaining-skills-and-improving-the-improver', previous: 'self-improving-ai-19-test-time-training-and-forgetting', next: 'self-improving-ai-21-learning-to-improve-the-improver' },
  { number: 21, math: 15, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-21-learning-to-improve-the-improver', previous: 'self-improving-ai-20-retaining-skills-and-improving-the-improver', next: 'self-improving-ai-22-learning-the-parameter-update-rule' },
  { number: 22, math: 15, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-22-learning-the-parameter-update-rule', previous: 'self-improving-ai-21-learning-to-improve-the-improver', next: 'self-improving-ai-23-self-edits-and-meta-learning' },
  { number: 23, math: 17, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-23-self-edits-and-meta-learning', previous: 'self-improving-ai-22-learning-the-parameter-update-rule', next: 'self-improving-ai-24-learning-inside-the-hidden-state' },
  { number: 24, math: 16, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-24-learning-inside-the-hidden-state', previous: 'self-improving-ai-23-self-edits-and-meta-learning', next: 'self-improving-ai-25-memory-and-intrinsic-motivation' },
  { number: 25, math: 18, figures: 9, primarySlides: 5, timingRows: 5, slug: 'self-improving-ai-25-memory-and-intrinsic-motivation', previous: 'self-improving-ai-24-learning-inside-the-hidden-state', next: 'self-improving-ai-26-when-the-score-and-the-goal-diverge' },
  { number: 26, math: 15, figures: 8, primarySlides: 4, timingRows: 4, slug: 'self-improving-ai-26-when-the-score-and-the-goal-diverge', previous: 'self-improving-ai-25-memory-and-intrinsic-motivation', next: null },
];
const mappingSummary = '슬라이드별 영상 위치';
const lectureParts = [
  { number: 1, id: 'self-improving-ai-part-1', title: '자가개선 AI — 상편', first: 1, last: 13 },
  { number: 2, id: 'self-improving-ai-part-2', title: '자가개선 AI — 하편', first: 14, last: 26 },
];
const timestampGroups = {
  1: [1, 10, 51, 100, 159],
  2: [217, 241, 296, 422, 483],
  3: [510, 523, 570, 613, 677, 707],
  7: [1873, 1918, 1972, 2014, 2086],
  8: [2160, 2193, 2395, 2471, 2564],
  9: [2603, 2647, 2690, 2695, 2719],
  10: [2739, 2891, 2939, 3023, 3084],
  11: [3136, 3173, 3227, 3316, 3401],
  12: [3519, 3547, 3617, 3677, 3759],
  13: [3782, 3820],
  14: [0, 7, 45, 216, 285],
  15: [285, 315, 336, 348, 427],
  16: [500, 584, 779, 833, 931],
  17: [1032, 1055, 1164, 1204, 1230],
  18: [1260, 1331, 1455, 1475, 1519],
  19: [1616, 1675, 1726, 1747, 1777],
  20: [1818, 1861, 1992, 2031, 2075],
  21: [2108, 2116, 2148, 2193, 2249],
  22: [2324, 2349, 2357, 2388, 2406],
  23: [2422, 2522, 2654, 2574, 2565],
  24: [2747, 2854, 2874, 2922, 3025],
  25: [3142, 3323, 3547, 3557, 3709],
  26: [3801, 3855, 3928, 4013],
};
const productionPhrases = [
  /(?:자막|자료|원문|원고|보충 자료)[·\s]*(?:조회|대조|확인)일/,
  /track\s*[:=]?\s*[`'"“]?manual\b/i,
  /(?:영어 편집 이미지|이미지)의?\s*(?:구성일|제작일)/,
  /영어\s*편집\s*이미지\s*(?:구성|제작)\s*[:：]/,
  /비공식\s*영어\s*편집본/,
  /Original source,\s*not redrawn|Unofficial English|re-rendered from the original/i,
  /표지를\s*1쪽으로\s*센다/,
  /원본 자료의 공개 접근|재사용 허가와 동일/,
];

function loadChapterManifest(chapter) {
  const directory = `../docs/self-improving-ai/source-assets/${String(chapter.number).padStart(2, '0')}`;
  const primary = JSON.parse(fs.readFileSync(`${directory}/manifest.json`, 'utf8'));
  const records = [...primary.assets];
  if (chapter.number <= 3) {
    assert.equal(primary.assets.length, chapter.primarySlides, `Chapter ${chapter.number} primary manifest`);
    const supplementary = JSON.parse(fs.readFileSync(`${directory}/supplementary-manifest.json`, 'utf8'));
    assert.equal(supplementary.assets.length, 4, `Chapter ${chapter.number} supplementary manifest`);
    records.push(...supplementary.assets);
  }
  // Chapters 01–03 keep their historical manifests. Normalize field names only;
  // expected hashes, dimensions and page URLs still come from those records.
  const assets = records.map(asset => {
    const assetPath = asset.path ?? asset.file ?? asset.asset_path ?? asset.assetPath;
    assert.equal(typeof assetPath, 'string', `Missing asset path in chapter ${chapter.number}`);
    assert(assetPath.startsWith(`spaceship-ui/site/assets/assets/posts/${chapter.slug}/`), assetPath);
    const src = asset.src ?? asset.publicAssetUrl ?? assetPath.slice('spaceship-ui/site/assets'.length);
    const sourceBase = asset.source_url ?? asset.sourceUrl;
    const sourcePage = asset.pdf_page ?? asset.pdfPage;
    const source = typeof asset.source === 'string' ? asset.source :
      asset.source_page_url ?? (sourceBase && Number.isInteger(sourcePage) ? `${sourceBase}#page=${sourcePage}` : null);
    const sha256 = asset.sha256 ?? asset.asset_sha256;
    assert.equal(src, assetPath.slice('spaceship-ui/site/assets'.length));
    assert.match(sha256 || '', /^[a-f0-9]{64}$/);
    assert.equal(typeof source, 'string', `Missing source in ${assetPath}`);
    const sourceType = asset.source_type ?? 'pdf';
    if (sourceType === 'pdf') {
      assert(source.includes('#page='), `Missing source page in ${assetPath}`);
    } else if (sourceType === 'author_diagram') {
      assert.equal(chapter.number, 26, 'Original welfare example belongs to chapter 26');
      assert.equal(src, `/assets/posts/${chapter.slug}/welfare-two-rules.png`);
      assert.equal(source, 'https://web.stanford.edu/class/cs186/internal/lectures/alignment_1.html');
      assert.equal(asset.source_section, 'Red Teaming Moral Philosophy');
    } else {
      assert.equal(sourceType, 'web_figure', `Unsupported source type in ${assetPath}`);
      assert.equal(source, 'https://alignment.anthropic.com/2026/automated-w2s-researcher/');
      assert.match(asset.source_figure_url || '', /^https:\/\/alignment\.anthropic\.com\/2026\/automated-w2s-researcher\/fig[458]\.png$/);
      assert.equal(asset.source_figure_sha256, sha256, `Web figure must retain source bytes: ${assetPath}`);
    }
    assert(Number.isInteger(asset.width) && asset.width > 0, assetPath);
    assert(Number.isInteger(asset.height) && asset.height > 0, assetPath);
    return { path: assetPath, src, source, sourceType, sha256, width: asset.width, height: asset.height };
  });
  assert.equal(assets.length, chapter.figures, `Chapter ${chapter.number} total assets`);
  assert.equal(new Set(assets.map(asset => asset.src)).size, chapter.figures, `Chapter ${chapter.number} unique assets`);
  if (chapter.number === 13) {
    const mainSlides = records.filter(asset => /^main-\d+$/.test(asset.slot || ''));
    assert.equal(primary.source_pdf_total_pages, 62, 'Chapter 13 source deck has exactly 62 pages');
    assert.deepEqual(primary.primary_page_range, [61, 62], 'Chapter 13 source range');
    assert.equal(mainSlides.length, chapter.primarySlides, 'Chapter 13 has exactly two main slides');
    assert.deepEqual(mainSlides.map(asset => asset.pdf_page), [61, 62], 'Chapter 13 concludes the 62-page source deck');
  }
  if (chapter.number >= 14 && chapter.number <= 26) {
    const mainSlides = records.filter(asset => /^main-\d+$/.test(asset.slot || ''));
    const pageRange = { 14: [1, 5], 15: [6, 10], 16: [11, 15], 17: [16, 20], 18: [21, 25], 19: [26, 30], 20: [31, 35], 21: [36, 40], 22: [41, 45], 23: [46, 50], 24: [51, 55], 25: [56, 60], 26: [61, 64] }[chapter.number];
    const expectedPages = Array.from({ length: pageRange[1] - pageRange[0] + 1 }, (_, index) => pageRange[0] + index);
    assert.equal(primary.source_pdf_total_pages, 64, `Chapter ${chapter.number} uses the separate 64-page lower lecture`);
    assert.deepEqual(primary.primary_page_range, pageRange, `Chapter ${chapter.number} lower lecture source range`);
    assert.equal(mainSlides.length, chapter.primarySlides);
    assert.deepEqual(mainSlides.map(asset => asset.pdf_page), expectedPages);
    assert(mainSlides.every(asset => (asset.source ?? asset.source_page_url) === `https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf#page=${asset.pdf_page}`), `Chapter ${chapter.number} slide links use the lower lecture PDF`);
  }
  return { assets };
}

const mappingExpression = `Array.from(document.querySelectorAll('article details > summary')).filter(summary => summary.textContent.trim() === ${JSON.stringify(mappingSummary)})`;

async function clickMappingSummary(cdp, session) {
  const point = await evaluate(cdp, session, `(async()=>{
    const summary=(${mappingExpression})[0];
    summary.scrollIntoView({block:'center',behavior:'instant'});
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const rect=summary.getBoundingClientRect();
    const x=rect.left+rect.width/2,y=rect.top+rect.height/2;
    return {x,y,hit:summary.contains(document.elementFromPoint(x,y)),width:rect.width,height:rect.height};
  })()`);
  assert(point.hit && point.width > 0 && point.height > 0, `Mapping summary is not clickable: ${JSON.stringify(point)}`);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y }, session);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 }, session);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 }, session);
}

async function verifyMappingDetails(cdp, session, expectedRows) {
  assert(Number.isInteger(expectedRows) && expectedRows > 0, 'Exact slide timing row count');
  const initial = await evaluate(cdp, session, `(()=>{
    const summaries=${mappingExpression};
    return {count:summaries.length,open:summaries[0]?.parentElement.open};
  })()`);
  assert.equal(initial.count, 1, 'One slide timing disclosure');
  assert.equal(initial.open, false, 'Slide timing disclosure is closed by default');
  await clickMappingSummary(cdp, session);
  await waitExpression(cdp, session, `(${mappingExpression})[0].parentElement.open === true`, 'Slide timing disclosure opens on click');
  const opened = await evaluate(cdp, session, `(()=>{
    const details=(${mappingExpression})[0].parentElement,table=details.querySelector('table');
    const rect=table?.getBoundingClientRect();
    return {open:details.open,rows:table?.querySelectorAll('tbody tr').length || 0,width:rect?.width || 0,height:rect?.height || 0,
      overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth)};
  })()`);
  assert(opened.open && opened.rows === expectedRows && opened.width > 0 && opened.height > 0, `Opened slide timing table: ${JSON.stringify(opened)}`);
  assert(opened.overflow <= 2, `Opened slide timing page overflow: ${JSON.stringify(opened)}`);
  await clickMappingSummary(cdp, session);
  await waitExpression(cdp, session, `(${mappingExpression})[0].parentElement.open === false`, 'Slide timing disclosure closes on click');
  return { summary: mappingSummary, expectedRows, initialOpen: false, afterFirstClick: opened, afterSecondClickOpen: false };
}

async function clickSummarySelector(cdp, session, selector) {
  const point = await evaluate(cdp, session, `(async()=>{
    const summary=document.querySelector(${JSON.stringify(selector)});
    summary.scrollIntoView({block:'center',behavior:'instant'});
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const rect=summary.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2;
    return {x,y,hit:summary.contains(document.elementFromPoint(x,y))};
  })()`);
  assert(point.hit, `Series summary is clickable: ${selector}`);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y }, session);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 }, session);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 }, session);
}

async function verifyArticleParts(cdp, session, chapter, width) {
  const map = await evaluate(cdp, session, `(()=>{
    const map=document.querySelector('[data-self-improving-map]');
    return {currentPart:Number(map?.dataset.currentPart),currentLabel:map?.querySelector('[data-current-series-part]')?.textContent,
      parts:Array.from(map?.querySelectorAll('[data-series-map-part]') || []).map(part=>({number:Number(part.dataset.seriesMapPart),open:part.open,
        links:Array.from(part.querySelectorAll('a')).map(a=>({href:a.getAttribute('href'),current:a.getAttribute('aria-current')}))}))};
  })()`);
  assert.equal(map.currentPart, chapter.number <= 13 ? 1 : 2, 'Correct current lecture part');
  assert.equal(map.currentLabel.trim(), `${chapter.number <= 13 ? '상편' : '하편'} · 현재 ${chapter.number}편`);
  assert.deepEqual(map.parts.map(part => part.number), [1, 2], 'Both lecture parts are available');
  for (const part of lectureParts) {
    const actual = map.parts.find(item => item.number === part.number);
    assert.equal(actual.open, false, 'Article part lists start closed');
    assert.deepEqual(actual.links.map(link => link.href), chapters.filter(item => item.number >= part.first && item.number <= part.last).map(item => `/posts/${item.slug}/`));
  }
  const currentLinks = map.parts.flatMap(part => part.links).filter(link => link.current === 'page');
  assert.deepEqual(currentLinks.map(link => link.href), [`/posts/${chapter.slug}/`]);
  if (chapter.number >= 13) {
    for (const part of lectureParts) {
      const selector = `[data-self-improving-map] [data-series-map-part="${part.number}"]`;
      await clickSummarySelector(cdp, session, `${selector} > summary`);
      await waitExpression(cdp, session, `document.querySelector(${JSON.stringify(selector)}).open === true`, 'Article part opens on click');
      await clickSummarySelector(cdp, session, `${selector} > summary`);
      await waitExpression(cdp, session, `document.querySelector(${JSON.stringify(selector)}).open === false`, 'Article part closes on click');
    }
    await evaluate(cdp, session, "document.querySelector('[data-self-improving-map]').scrollIntoView({block:'center',behavior:'instant'})");
    await evaluate(cdp, session, 'new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, session);
    fs.writeFileSync(path.join(out, `self-improving-map-${chapter.number}-${width}.png`), Buffer.from(shot.data, 'base64'));
    map.interactionChecks = 'Both part disclosures opened and closed by pointer click';
  }
  return map;
}

const manifests = new Map();
const evidence = { checkedAt: new Date().toISOString(), publicBase: process.env.JJO_SMOKE_BASE_URL || null, views: [], assets: [], series: [] };
let preview, chrome, cdp;
try {
  for (const chapter of chapters) {
    assert(Number.isInteger(chapter.math) && chapter.math > 0, `Set the exact math count for chapter ${chapter.number}`);
    assert(Number.isInteger(chapter.figures) && chapter.figures > 0, `Exact figure count for chapter ${chapter.number}`);
    if (chapter.timingRows !== null && timestampGroups[chapter.number]) assert.equal(chapter.timingRows, timestampGroups[chapter.number].length, `Exact timestamp count for chapter ${chapter.number}`);
    const manifest = loadChapterManifest(chapter);
    manifests.set(chapter.number, manifest);
    for (const asset of manifest.assets) {
      const data = fs.readFileSync(path.resolve('..', asset.path));
      assert.equal(crypto.createHash('sha256').update(data).digest('hex'), asset.sha256);
      const record = { path: asset.path, sha256: asset.sha256, source: asset.source };
      if (process.env.JJO_SMOKE_BASE_URL) {
        const response = await fetch(new URL(asset.src, process.env.JJO_SMOKE_BASE_URL), { signal: AbortSignal.timeout(30000), cache: 'no-store' });
        assert.equal(response.status, 200, `Public asset ${asset.src}`);
        const publicHash = crypto.createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
        assert.equal(publicHash, asset.sha256, `Public asset hash ${asset.src}`);
        record.publicSha256 = publicHash;
      }
      evidence.assets.push(record);
    }
  }
  if (!process.env.JJO_SMOKE_BASE_URL) preview = await startPreview();
  chrome = await startChrome();
  cdp = await Cdp.connect(chrome.url);
  const { sessionId: session } = await attach(cdp);
  for (const width of [390, 1440]) {
    await viewport(cdp, session, { width, height: 1000, mobile: width < 500, touch: width < 500, reduced: true });
    for (const chapter of chapters) {
      await navigate(cdp, session, `/posts/${chapter.slug}/`);
      await waitExpression(cdp, session, `document.querySelectorAll('article figure[data-learning-figure]').length === ${chapter.figures}`, `Exactly ${chapter.figures} lesson figures`);
      const articleParts = await verifyArticleParts(cdp, session, chapter, width);
      const timingDetails = chapter.timingRows !== null ? await verifyMappingDetails(cdp, session, chapter.timingRows) : null;
      for (let index = 0; index < chapter.figures; index++) {
        await evaluate(cdp, session, `document.querySelectorAll('article figure[data-learning-figure]')[${index}].scrollIntoView({block:'center',behavior:'instant'})`);
        await waitExpression(cdp, session, `(()=>{const image=document.querySelectorAll('article figure[data-learning-figure] img')[${index}];return image.complete && image.naturalWidth>0 && image.naturalHeight>0;})()`, 'Lesson image decoded');
      }
      const view = await evaluate(cdp, session, `(()=>{
        const figures=Array.from(document.querySelectorAll('article figure[data-learning-figure]'));
        const navigation=document.querySelector('[data-series-reading-navigation="self-improving-ai"]');
        return { url:location.href, width:innerWidth,
          overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
          figures:figures.map(f=>{const i=f.querySelector('img'),a=f.querySelector('figcaption a');return {src:i.getAttribute('src'),naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,alt:i.alt,source:a?.href,caption:f.querySelector('figcaption')?.textContent};}),
          math:document.querySelectorAll('article .katex').length,
          mathErrors:document.querySelectorAll('.katex-error').length,
          previous:navigation?.querySelector('[rel="prev"]')?.getAttribute('href') || null,
          next:navigation?.querySelector('[rel="next"]')?.getAttribute('href') || null,
          seriesPart:Number(navigation?.dataset.seriesPart),
          previousLabel:navigation?.querySelector('[rel="prev"] span')?.textContent || null,
          nextLabel:navigation?.querySelector('[rel="next"] span')?.textContent || null
        };
      })()`);
      assert.equal(view.figures.length, chapter.figures);
      assert.equal(new Set(view.figures.map(figure => figure.src)).size, chapter.figures);
      assert.equal(view.width, width);
      assert.equal(view.math, chapter.math);
      assert.equal(view.mathErrors, 0);
      assert(view.overflow <= 2, JSON.stringify(view));
      assert.equal(view.previous, chapter.previous ? `/posts/${chapter.previous}/` : null);
      assert.equal(view.next, chapter.next ? `/posts/${chapter.next}/` : null);
      assert.equal(view.seriesPart, chapter.number <= 13 ? 1 : 2);
      if (chapter.number === 13) assert.equal(view.nextLabel, '다음 편 · 하편');
      if (chapter.number === 14) assert.equal(view.previousLabel, '이전 편 · 상편');
      if (chapter.number === 14) assert.equal(view.nextLabel, '다음 편 · 하편');
      if (chapter.number === 15) assert.equal(view.previousLabel, '이전 편 · 하편');
      if (chapter.number === 15) assert.equal(view.nextLabel, '다음 편 · 하편');
      if (chapter.number >= 16) assert.equal(view.previousLabel, '이전 편 · 하편');
      if (chapter.number >= 16 && chapter.next) assert.equal(view.nextLabel, '다음 편 · 하편');
      view.articleParts = articleParts;
      if (timingDetails) view.timingDetails = timingDetails;
      for (const figure of view.figures) {
        const expected = manifests.get(chapter.number).assets.find(asset => asset.src === figure.src);
        assert(expected, `Unexpected image ${figure.src}`);
        assert.equal(figure.naturalWidth, expected.width);
        assert.equal(figure.naturalHeight, expected.height);
        assert.equal(figure.source, expected.source);
        assert(figure.alt.length > 10 && figure.caption.length > 20);
        if (expected.sourceType === 'pdf') assert(figure.source?.includes('#page='));
      }
      if (timestampGroups[chapter.number]) {
        const transcriptLinks = await evaluate(cdp, session, `Array.from(document.querySelectorAll('article a[href*="youtube.com/watch"]')).map(a=>a.href)`);
        for (const seconds of timestampGroups[chapter.number]) {
          assert(transcriptLinks.some(href => { const url = new URL(href); return url.searchParams.get('v') === (chapter.number <= 13 ? 's06mSAGN4gM' : 'cQLKVzbwN7I') && url.searchParams.get('t') === `${seconds}s`; }), `Missing transcript timestamp ${seconds}`);
        }
        view.transcriptLinks = transcriptLinks;
      }
      // ContentNotice is outside article. Ignore text that is actually hidden,
      // including closed details, while checking all rendered article text.
      const visibleText = await evaluate(cdp, session, `(()=>{
        const walker=document.createTreeWalker(document.querySelector('article'),NodeFilter.SHOW_TEXT),parts=[];
        let node;
        while(node=walker.nextNode()){
          const parent=node.parentElement;
          if(!node.textContent.trim() || parent.closest('script,style,noscript')) continue;
          let hidden=false;
          for(let ancestor=parent;ancestor;ancestor=ancestor.parentElement){
            if(ancestor.tagName==='DETAILS' && !ancestor.open && !ancestor.querySelector(':scope > summary')?.contains(parent)){hidden=true;break;}
          }
          if(hidden || getComputedStyle(parent).visibility==='hidden') continue;
          const range=document.createRange();range.selectNodeContents(node);
          if(Array.from(range.getClientRects()).some(rect=>rect.width>0 && rect.height>0)) parts.push(node.textContent);
        }
        return parts.join(' ').replace(/\\s+/g,' ');
      })()`);
      assert(visibleText.length > 500, `Article text missing in ${chapter.slug}`);
      const productionMatches = productionPhrases.flatMap(pattern => visibleText.match(pattern)?.[0] || []);
      assert.deepEqual(productionMatches, [], `Visible production notes in ${chapter.slug}`);
      view.editorial = { visibleTextCharacters: visibleText.length, productionMatches };
      evidence.views.push(view);
      const screenshotIndices = chapter.number >= 6 ? Array.from({ length: chapter.figures }, (_, index) => index) : chapter.number <= 3 ? [0, 7] : [1, 7];
      for (const index of screenshotIndices) {
        await evaluate(cdp, session, `document.querySelectorAll('article figure[data-learning-figure]')[${index}].scrollIntoView({block:'center',behavior:'instant'})`);
        // Image decoding and layout readiness are separate from a painted frame.
        const painted = await evaluate(cdp, session, `(async()=>{
          const image=document.querySelectorAll('article figure[data-learning-figure] img')[${index}];
          await image.decode();
          await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
          const rect=image.getBoundingClientRect(),style=getComputedStyle(image);
          return {index:${index},complete:image.complete,width:rect.width,height:rect.height,
            visible:rect.bottom>0 && rect.top<innerHeight && rect.right>0 && rect.left<innerWidth && style.visibility!=='hidden' && style.display!=='none'};
        })()`);
        assert(painted.complete && painted.visible && painted.width > 0 && painted.height > 0, JSON.stringify(painted));
        (view.screenshotReadiness ||= []).push(painted);
        const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, session);
        fs.writeFileSync(path.join(out, `${chapter.slug}-${width}-figure-${index}.png`), Buffer.from(shot.data, 'base64'));
      }
      console.log('PASS Self-Improving article', chapter.slug, width, JSON.stringify({ images: view.figures.length, math: view.math, errors: view.mathErrors, overflow: view.overflow }));
    }
    await navigate(cdp, session, '/posts/');
    for (const part of lectureParts) {
      const selector = `[data-series-group="${part.id}"]`;
      await waitExpression(cdp, session, `!!document.querySelector(${JSON.stringify(selector)})`, 'Self-Improving lecture part');
      const group = await evaluate(cdp, session, `(()=>{const g=document.querySelector(${JSON.stringify(selector)});return {title:g.querySelector('.series-group__title')?.textContent,count:g.querySelector('.series-group__count')?.textContent,initialOpen:g.open,links:[...new Set(Array.from(g.querySelectorAll('a[href^="/posts/"]')).map(a=>a.getAttribute('href')))]};})()`);
      const partChapters = chapters.filter(chapter => chapter.number >= part.first && chapter.number <= part.last);
      assert.equal(group.title, part.title);
      assert.equal(group.count, `${partChapters.length}편`);
      assert.equal(group.initialOpen, false, 'Lecture part shelf starts closed');
      const groupPaths = [...new Set(group.links.map(href => href.replace(/\/+$/, '')))];
      assert.deepEqual(groupPaths, partChapters.map(chapter => `/posts/${chapter.slug}`), `${part.title} exact membership and order`);
      await clickSummarySelector(cdp, session, `${selector} > summary`);
      await waitExpression(cdp, session, `document.querySelector(${JSON.stringify(selector)}).open === true`, 'Lecture shelf opens on click');
      await evaluate(cdp, session, `document.querySelector(${JSON.stringify(`${selector} > summary`)}).scrollIntoView({block:'center',behavior:'instant'})`);
      await evaluate(cdp, session, 'new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, session);
      fs.writeFileSync(path.join(out, `self-improving-group-part-${part.number}-${width}.png`), Buffer.from(shot.data, 'base64'));
      await clickSummarySelector(cdp, session, `${selector} > summary`);
      await waitExpression(cdp, session, `document.querySelector(${JSON.stringify(selector)}).open === false`, 'Lecture shelf closes on click');
      evidence.series.push({ width, part: part.number, ...group, afterFirstClickOpen: true, afterSecondClickOpen: false });
      console.log('PASS Self-Improving lecture part', width, JSON.stringify(group));
    }
  }
  evidence.result = 'PASS';
} catch (error) {
  evidence.result = 'FAIL';
  evidence.error = String(error?.stack || error);
  throw error;
} finally {
  fs.writeFileSync(path.join(out, 'self-improving-reading.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log('SELF_IMPROVING_EVIDENCE', JSON.stringify(evidence));
  cdp?.close();
  await stopChild(chrome?.child);
  await stopChild(preview);
  if (chrome) removeProfile(chrome.profile);
}
process.exit(0);
