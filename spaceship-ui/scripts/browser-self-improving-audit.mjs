import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { startPreview, startChrome, Cdp, attach, stopChild, removeProfile, evaluate, navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

const out = process.env.JJO_SELF_IMPROVING_ARTIFACTS || path.join(os.tmpdir(), 'jjo-self-improving');
fs.mkdirSync(out, { recursive: true });
const chapters = [
  { number: 1, math: 38, slug: 'self-improving-ai-01-overview', previous: null, next: 'self-improving-ai-02-learning-targets' },
  { number: 2, math: 72, slug: 'self-improving-ai-02-learning-targets', previous: 'self-improving-ai-01-overview', next: 'self-improving-ai-03-self-correction-to-rl' },
  { number: 3, math: 31, slug: 'self-improving-ai-03-self-correction-to-rl', previous: 'self-improving-ai-02-learning-targets', next: 'self-improving-ai-04-sparse-rewards-and-shaping' },
  { number: 4, math: 26, slug: 'self-improving-ai-04-sparse-rewards-and-shaping', previous: 'self-improving-ai-03-self-correction-to-rl', next: 'self-improving-ai-05-reward-design-to-ai-feedback' },
  { number: 5, math: 26, slug: 'self-improving-ai-05-reward-design-to-ai-feedback', previous: 'self-improving-ai-04-sparse-rewards-and-shaping', next: 'self-improving-ai-06-self-evaluation-and-entropy' },
  { number: 6, math: 20, slug: 'self-improving-ai-06-self-evaluation-and-entropy', previous: 'self-improving-ai-05-reward-design-to-ai-feedback', next: 'self-improving-ai-07-unsupervised-rlvr-and-test-time-training' },
  { number: 7, math: 22, slug: 'self-improving-ai-07-unsupervised-rlvr-and-test-time-training', previous: 'self-improving-ai-06-self-evaluation-and-entropy', next: 'self-improving-ai-08-entropy-estimation-and-gradients' },
  { number: 8, math: 32, slug: 'self-improving-ai-08-entropy-estimation-and-gradients', previous: 'self-improving-ai-07-unsupervised-rlvr-and-test-time-training', next: 'self-improving-ai-09-entropy-paths-and-self-generated-inputs' },
  { number: 9, math: 31, slug: 'self-improving-ai-09-entropy-paths-and-self-generated-inputs', previous: 'self-improving-ai-08-entropy-estimation-and-gradients', next: 'self-improving-ai-10-self-play-and-external-feedback' },
  { number: 10, math: 18, slug: 'self-improving-ai-10-self-play-and-external-feedback', previous: 'self-improving-ai-09-entropy-paths-and-self-generated-inputs', next: null },
];
const mappingChapters = new Set([1, 7, 8, 9, 10]);
const mappingSummary = '슬라이드별 영상 위치';
const timestampGroups = {
  1: [1, 10, 51, 100, 159],
  2: [217, 241, 296, 422, 483],
  3: [510, 523, 570, 613, 677, 707],
  7: [1873, 1918, 1972, 2014, 2086],
  8: [2160, 2193, 2395, 2471, 2564],
  9: [2603, 2647, 2690, 2695, 2719],
  10: [2739, 2891, 2939, 3023, 3084],
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
    assert.equal(primary.assets.length, 5, `Chapter ${chapter.number} primary manifest`);
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
    assert(source.includes('#page='), `Missing source page in ${assetPath}`);
    assert(Number.isInteger(asset.width) && asset.width > 0, assetPath);
    assert(Number.isInteger(asset.height) && asset.height > 0, assetPath);
    return { path: assetPath, src, source, sha256, width: asset.width, height: asset.height };
  });
  assert.equal(assets.length, 9, `Chapter ${chapter.number} total assets`);
  assert.equal(new Set(assets.map(asset => asset.src)).size, 9, `Chapter ${chapter.number} unique assets`);
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

async function verifyMappingDetails(cdp, session) {
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
  assert(opened.open && opened.rows === 5 && opened.width > 0 && opened.height > 0, `Opened slide timing table: ${JSON.stringify(opened)}`);
  assert(opened.overflow <= 2, `Opened slide timing page overflow: ${JSON.stringify(opened)}`);
  await clickMappingSummary(cdp, session);
  await waitExpression(cdp, session, `(${mappingExpression})[0].parentElement.open === false`, 'Slide timing disclosure closes on click');
  return { summary: mappingSummary, initialOpen: false, afterFirstClick: opened, afterSecondClickOpen: false };
}

const manifests = new Map();
const evidence = { checkedAt: new Date().toISOString(), publicBase: process.env.JJO_SMOKE_BASE_URL || null, views: [], assets: [], series: [] };
let preview, chrome, cdp;
try {
  for (const chapter of chapters) {
    assert(Number.isInteger(chapter.math) && chapter.math > 0, `Set the exact math count for chapter ${chapter.number}`);
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
      await waitExpression(cdp, session, "document.querySelectorAll('article figure[data-learning-figure]').length === 9", 'Nine lesson figures');
      const timingDetails = mappingChapters.has(chapter.number) ? await verifyMappingDetails(cdp, session) : null;
      for (let index = 0; index < 9; index++) {
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
          next:navigation?.querySelector('[rel="next"]')?.getAttribute('href') || null
        };
      })()`);
      assert.equal(view.figures.length, 9);
      assert.equal(new Set(view.figures.map(figure => figure.src)).size, 9);
      assert.equal(view.width, width);
      assert.equal(view.math, chapter.math);
      assert.equal(view.mathErrors, 0);
      assert(view.overflow <= 2, JSON.stringify(view));
      assert.equal(view.previous, chapter.previous ? `/posts/${chapter.previous}/` : null);
      assert.equal(view.next, chapter.next ? `/posts/${chapter.next}/` : null);
      if (timingDetails) view.timingDetails = timingDetails;
      for (const figure of view.figures) {
        const expected = manifests.get(chapter.number).assets.find(asset => asset.src === figure.src);
        assert(expected, `Unexpected image ${figure.src}`);
        assert.equal(figure.naturalWidth, expected.width);
        assert.equal(figure.naturalHeight, expected.height);
        assert.equal(figure.source, expected.source);
        assert(figure.alt.length > 10 && figure.caption.length > 20);
        assert(figure.source?.includes('#page='));
      }
      if (timestampGroups[chapter.number]) {
        const transcriptLinks = await evaluate(cdp, session, `Array.from(document.querySelectorAll('article a[href*="youtube.com/watch"]')).map(a=>a.href)`);
        for (const seconds of timestampGroups[chapter.number]) {
          assert(transcriptLinks.some(href => { const url = new URL(href); return url.searchParams.get('v') === 's06mSAGN4gM' && url.searchParams.get('t') === `${seconds}s`; }), `Missing transcript timestamp ${seconds}`);
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
      const screenshotIndices = chapter.number >= 6 ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : chapter.number <= 3 ? [0, 7] : [1, 7];
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
    await waitExpression(cdp, session, "!!document.querySelector('[data-series-group=" + '"self-improving-ai"' + "]')", 'Self-Improving series group');
    const group = await evaluate(cdp, session, `(()=>{const g=document.querySelector('[data-series-group="self-improving-ai"]');return {title:g.querySelector('.series-group__title')?.textContent,count:g.querySelector('.series-group__count')?.textContent,links:[...new Set(Array.from(g.querySelectorAll('a[href^="/posts/"]')).map(a=>a.getAttribute('href')))]};})()`);
    assert.equal(group.title, '자가개선 AI');
    assert.equal(group.count, '10편');
    // List cards omit the optional trailing slash; retain exact path membership checks.
    const groupPaths = new Set(group.links.map(href => href.replace(/\/+$/, '')));
    assert.equal(groupPaths.size, 10);
    for (const chapter of chapters) assert(groupPaths.has(`/posts/${chapter.slug}`), `Series missing ${chapter.slug}`);
    assert.deepEqual([...groupPaths], chapters.map(chapter => `/posts/${chapter.slug}`), 'Series order 01–10');
    await evaluate(cdp, session, "(()=>{const g=document.querySelector('[data-series-group=\"self-improving-ai\"]');g.open=true;g.scrollIntoView({block:'center',behavior:'instant'});})()");
    await evaluate(cdp, session, 'new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, session);
    fs.writeFileSync(path.join(out, `self-improving-group-${width}.png`), Buffer.from(shot.data, 'base64'));
    evidence.series.push({ width, ...group });
    console.log('PASS Self-Improving series name and membership', width, JSON.stringify(group));
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
