import assert from 'node:assert/strict';
import fs from 'node:fs';
import { graphVisual } from '../src/lib/experience/graph-visuals.mjs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, startPreview, startChrome, stopChild, removeProfile, sleep } from './browser-smoke-harness.mjs';

const out = 'mobile-performance';
fs.mkdirSync(out, { recursive: true });
let preview, chrome, cdp, sessionId;
const results = [];
const hardStop = setTimeout(() => { console.error('mobile-performance: hard timeout'); process.exit(1); }, 120_000);
async function capture(name) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(`${out}/${name}.png`, Buffer.from(data, 'base64'));
}
// Capture actual paint calls during requested samples. Untimed checks use the
// same article anchors and data as keyboard navigation to identify each mark.
function installAtlasPaintProbe() {
  const ctx = CanvasRenderingContext2D.prototype;
  const gradients = new WeakMap();
  const atlas = c => c.canvas.hasAttribute('data-ascii-art');
  let frame, segment;
  window.__sampleAtlas = true;
  const wrap = (prototype,name,inspect) => {
    const original = prototype[name];
    prototype[name] = function(...args) {
      const result = original.apply(this,args);
      inspect.call(this,args,result);
      return result;
    };
  };
  wrap(ctx,'createLinearGradient',function(coords,result) {
    if (atlas(this)) gradients.set(result,{coords,stops:[]});
  });
  wrap(CanvasGradient.prototype,'addColorStop',function([offset,color]) {
    gradients.get(this)?.stops.push({offset,color:color.toLowerCase()});
  });
  wrap(ctx,'clearRect',function() {
    if (!atlas(this)) return;
    window.__asciiDraws++;
    frame = window.__sampleAtlas ? {stars:new Map(),edges:new Map()} : undefined;
    if (frame) window.__atlasFrame = frame;
  });
  const key = (x,y) => x.toFixed(3)+','+y.toFixed(3);
  window.__atlasPositionKey = key;
  wrap(ctx,'fillText',function([,x,y]) {
    if (frame && window.__sampleAtlas && atlas(this)) frame.stars.set(key(x,y),String(this.fillStyle));
  });
  wrap(ctx,'beginPath',function() { if (frame) segment = undefined; });
  wrap(ctx,'moveTo',function([x,y]) { if (frame) segment = [key(x,y)]; });
  wrap(ctx,'lineTo',function([x,y]) { if (frame && segment) segment.push(key(x,y)); });
  wrap(ctx,'stroke',function() {
    if (!frame || !window.__sampleAtlas || !atlas(this) || segment?.length!==2) return;
    frame.edges.set(segment.join('/'),{
      ink:this.strokeStyle, gradient:gradients.get(this.strokeStyle), dashed:this.getLineDash().length>0
    });
  });
}
function verifyAtlasPaint() {
  window.__sampleAtlas = false;
  const frame = window.__atlasFrame, key = window.__atlasPositionKey;
  const theme = document.documentElement.classList.contains('dark') ? '--graph-dark' : '--graph-light';
  const nav = document.querySelector('.post-graph-links');
  const anchors = new Map([...document.querySelectorAll('[data-post-graph-node]')].map(a=>[a.dataset.postGraphNode,a]));
  const legend = new Map([...document.querySelectorAll('[data-graph-category]')].map(b=>[b.dataset.graphCategory,b.style.getPropertyValue(theme).trim()]));
  // A zero-sized point inherits the desktop stage's scale and rotation. Raw
  // canvas positions are local CSS pixels; link rectangles use viewport pixels.
  const points = document.createDocumentFragment(), centers = [];
  const articles = new Map(window.__atlasPayload.nodes.map(node=>{
    const anchor = anchors.get(node.id), style = anchor.style;
    const [x,y=0] = style.translate.split(/\s+/).map(parseFloat);
    const point = document.createElement('span');
    point.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none;left:'+x+'px;top:'+y+'px';
    points.append(point);
    centers.push([anchor,point]);
    return [node.id,{
      at:key(x,y),
      ink:style.getPropertyValue(theme).trim(),category:node.category
    }];
  }));
  nav.append(points);
  const misalignedLinks = centers.filter(([anchor,point])=>{
    const rect = anchor.getBoundingClientRect(), expected = point.getBoundingClientRect();
    return Math.abs(rect.x + rect.width / 2 - expected.x) > .5 || Math.abs(rect.y + rect.height / 2 - expected.y) > .5;
  }).length;
  for (const [,point] of centers) point.remove();
  let mismatchedStars=0, mismatchedEdges=0, cross=0, withinTopicGradients=0;
  for (const {at,ink} of articles.values()) if (frame.stars.get(at)!==ink) mismatchedStars++;
  for (const edge of window.__atlasPayload.edges) {
    const source=articles.get(edge.source ?? edge[0]), target=articles.get(edge.target ?? edge[1]);
    const line=frame.edges.get(source.at+'/'+target.at);
    const bridge = source.category!==target.category;
    if (bridge) cross++;
    if (!bridge && source.ink!==target.ink) withinTopicGradients++;
    if (line && line.dashed===bridge && source.ink===target.ink && line.ink===source.ink) continue;
    const gradient=line?.gradient, stops=gradient?.stops ?? [];
    if (!line || line.dashed!==bridge || stops[0]?.offset!==0 || stops[0].color!==source.ink ||
        stops.at(-1)?.offset!==1 || stops.at(-1).color!==target.ink ||
        key(...gradient.coords.slice(0,2))!==source.at || key(...gradient.coords.slice(2))!==target.at) mismatchedEdges++;
  }
  return {mismatchedStars,mismatchedEdges,misalignedLinks,cross,withinTopicGradients,legend:[...legend],theme:theme==='--graph-dark'?'dark':'light'};
}
async function checkAtlasPaint(label) {
  const actual = await evaluate(cdp,sessionId,'('+verifyAtlasPaint.toString()+')()');
  assert.equal(actual.mismatchedStars,0,label+' star inks');
  assert.equal(actual.mismatchedEdges,0,label+' edge strokes and endpoints');
  assert.equal(actual.misalignedLinks,0,label+' centered link hitboxes');
  assert(actual.cross>0,label+' includes cross-topic connections');
  assert(actual.withinTopicGradients>0,label+' distinguishes stars within one topic');
  for (const [category,ink] of actual.legend) assert.equal(ink,graphVisual(category)[actual.theme],label+' legend band');
}
try {
  preview = await startPreview(); chrome = await startChrome(); cdp = await Cdp.connect(chrome.url);
  ({ sessionId } = await attach(cdp, { normalizeHistoryPath: false }));
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__asciiDraws = 0;
    (${installAtlasPaintProbe.toString()})();
    window.__gpuProbes = 0;
    window.__graphRequests = 0;
    const originalFetch = window.fetch;
    window.fetch = async function(url,...args) {
      if (!String(url).includes('/writing-graph/')) return originalFetch.call(this,url,...args);
      window.__graphRequests++;
      if (window.__graphRequests === 1) {
        await new Promise((resolve,reject) => { window.__releaseAtlas = fail => fail ? reject(new Error('intentional graph fetch failure')) : resolve(); });
      }
      const response = await originalFetch.call(this,url,...args);
      if (response.ok) window.__atlasPayload = await response.clone().json();
      return response;
    };
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type,...args) {
      if (type === 'webgl2' || type === 'webgpu') window.__gpuProbes++;
      return getContext.call(this,type,...args);
    };
    ` }, sessionId);
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    for (const route of ['/', '/en/']) {
      await viewport(cdp, sessionId, { width, height: 844, mobile, touch: mobile, reduced: false });
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }, sessionId);
      await navigate(cdp, sessionId, route);
      await evaluate(cdp, sessionId, `document.querySelector('[data-experience-canvas]').scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp, sessionId, `document.querySelector('[data-profile-animation] img')?.complete && document.querySelector('[data-profile-animation] img')?.naturalWidth>0`, 'static profile decoded');
      await waitExpression(cdp,sessionId,"document.querySelector('[data-experience-canvas]').dataset.graphState==='loading' && typeof window.__releaseAtlas==='function'",'automatic visible-map request without click');
      const cold = await evaluate(cdp, sessionId, `({
        draws: window.__asciiDraws,
        gpuProbes: window.__gpuProbes,
        state: document.querySelector('[data-experience-canvas]').dataset.graphState,
        links: document.querySelectorAll('[data-post-graph-node]').length,
        loadingVisible: getComputedStyle(document.querySelector('[data-graph-loading]')).display !== 'none',
        loadingAnimation: getComputedStyle(document.querySelector('.post-graph-loader-glyph')).animationName,
        retryHidden: document.querySelector('[data-graph-activate]').hidden,
        requests: window.__graphRequests,
        resources: performance.getEntriesByType('resource').map(r=>({url:r.name,bytes:r.transferSize})),
        navigation: performance.getEntriesByType('navigation').map(r=>({bytes:r.transferSize,domContentLoaded:r.domContentLoadedEventEnd,load:r.loadEventEnd}))
      })`);
      assert.equal(cold.state,'loading');
      assert.equal(cold.requests,1);
      assert(cold.loadingVisible && cold.loadingAnimation !== 'none' && cold.retryHidden, 'Loading feedback only during the actual request');
      assert.equal(cold.draws,0);
      assert.equal(cold.gpuProbes,0,'ASCII page must not probe a GPU context');
      assert.equal(cold.links,0);
      assert(!cold.resources.some(r=>/writing-graph\/|mouse_surprised-once\.webp|mouse_surprised\.(gif|webp)/.test(r.url)), 'Held graph response and animated profile must not have downloaded');
      const rejectFirst = width === 390 && route === '/';
      await evaluate(cdp, sessionId, 'window.__releaseAtlas(' + rejectFirst + ')');
      if (rejectFirst) {
        await waitExpression(cdp,sessionId,"document.querySelector('[data-experience-canvas]').dataset.graphState==='error'",'retryable graph error');
        assert(await evaluate(cdp,sessionId,"!document.querySelector('[data-graph-activate]').hidden && getComputedStyle(document.querySelector('[data-graph-preview]')).display !== 'none' && getComputedStyle(document.querySelector('[data-graph-loading]')).display==='none'"));
        await evaluate(cdp, sessionId, "document.querySelector('[data-graph-activate]').click()");
      }
      await waitExpression(cdp, sessionId, "document.querySelector('[data-experience-canvas]').dataset.graphState==='ready' && window.__asciiDraws>0", 'automatic interactive graph painted');
      assert(await evaluate(cdp,sessionId,"document.querySelector('[data-graph-activate]').hidden && !document.querySelector('[data-graph-view-controls]').hidden && getComputedStyle(document.querySelector('[data-graph-loading]')).display==='none' && getComputedStyle(document.querySelector('.post-graph-loader-glyph')).animationName==='none'"), 'Animation removed after first paint');
      assert.equal(await evaluate(cdp,sessionId,'window.__graphRequests'), rejectFirst ? 2 : 1);
      await checkAtlasPaint('Initial spectrum');
      const positionExpression = "document.querySelector('[data-post-graph-node]').style.translate";
      const initialPosition = await evaluate(cdp,sessionId,positionExpression);
      const beforeRotation = await evaluate(cdp,sessionId,'window.__asciiDraws');
      await evaluate(cdp,sessionId,"document.querySelector('[data-graph-rotate=\"1\"]').click()");
      await waitExpression(cdp,sessionId,positionExpression+'!=='+JSON.stringify(initialPosition),'rotation control projects real nodes');
      await waitExpression(cdp,sessionId,"document.querySelector('[data-experience-canvas]').dataset.graphMotion==='still'",'rotation settles');
      const rotationDraws = await evaluate(cdp,sessionId,'window.__asciiDraws') - beforeRotation;
      assert(rotationDraws>=3,'Rotation must span multiple painted frames rather than jump');
      await evaluate(cdp,sessionId,"document.querySelector('[data-graph-category]').click()");
      assert.equal(await evaluate(cdp,sessionId,"document.querySelector('[data-graph-category]').getAttribute('aria-pressed')"),'true');
      await evaluate(cdp,sessionId,"document.querySelector('[data-graph-reset]').click()");
      await waitExpression(cdp,sessionId,positionExpression+'==='+JSON.stringify(initialPosition)+" && !document.querySelector('[data-graph-category][aria-pressed=\"true\"]')",'reset restores projection and category');
      await sleep(700);
      const before = await evaluate(cdp, sessionId, 'window.__asciiDraws');
      await sleep(800);
      const after = await evaluate(cdp, sessionId, 'window.__asciiDraws');
      assert.equal(after,before,'Graph must not redraw at rest on mobile or desktop');
      // Use a real mouse drag away from overlay controls and article links.
      if (!mobile) {
        const point = await evaluate(cdp,sessionId,`(() => {
          const host=document.querySelector('[data-experience-canvas]');
          const r=host.getBoundingClientRect();
          for (const f of [0.08,0.15,0.25,0.35,0.65,0.75,0.85,0.92]) {
            for (const g of [0.32,0.4,0.5,0.62,0.72]) {
              const x=Math.round(r.left+r.width*f),y=Math.round(r.top+r.height*g);
              const e=document.elementFromPoint(x,y);
              if (e && host.contains(e) && !e.closest('a,button')) return {x,y};
            }
          }
          return null;
        })()`);
        assert(point,'Non-link map surface available for drag');
        const previous = await evaluate(cdp,sessionId,`document.querySelector('[data-post-graph-node]').style.translate`);
        await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x,y:point.y},sessionId);
        await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,x:point.x,y:point.y},sessionId);
        await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',button:'left',buttons:1,x:point.x+45,y:point.y+16},sessionId);
        await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,x:point.x+45,y:point.y+16},sessionId);
        await waitExpression(cdp,sessionId,`document.querySelector('[data-post-graph-node]').style.translate!==${JSON.stringify(previous)}`,'real drag updates graph projection');
      }
      await waitExpression(cdp,sessionId,"document.querySelector('[data-experience-canvas]').dataset.graphMotion==='still'",'drag settles');
      const screenshotPrefix='graph-' + width + (route === '/en/' ? '-en' : '-ko');
      const initialTheme=await evaluate(cdp,sessionId,"document.documentElement.classList.contains('dark')?'dark':'light'");
      await capture(screenshotPrefix+'-'+initialTheme);
      const beforeTheme = await evaluate(cdp,sessionId,'window.__asciiDraws');
      await evaluate(cdp, sessionId, `window.__sampleAtlas=true; document.documentElement.classList.toggle('dark')`);
      await waitExpression(cdp, sessionId, `window.__asciiDraws > ${beforeTheme}`, 'static graph repaints on theme change');
      await checkAtlasPaint('Theme change');
      await capture(screenshotPrefix+'-'+(initialTheme==='dark'?'light':'dark'));
      await evaluate(cdp, sessionId, `document.documentElement.classList.toggle('dark')`);
      const counts = await evaluate(cdp, sessionId, `({
        actual:document.querySelectorAll('[data-post-graph-node]').length,
        expected:Number(document.querySelector('[data-experience-canvas]').dataset.graphCount),
        wrongLanguage:[...document.querySelectorAll('[data-post-graph-node]')].filter(a=>!a.getAttribute('href').startsWith(location.pathname.startsWith('/en/')?'/en/posts/':'/posts/')).length
      })`);
      assert(counts.actual > 0);
      assert.equal(counts.actual,counts.expected,'All graph article links retained');
      assert.equal(counts.wrongLanguage,0,'Graph links match the current language');
      await evaluate(cdp, sessionId, `document.querySelector('[data-profile-animation]').scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp,sessionId,`(()=>{const b=document.querySelector('[data-profile-animation]');const r=b?.getBoundingClientRect();return b?.dataset.profileState==='static'&&r?.width>0&&r?.height>0&&r.top<innerHeight&&r.bottom>0})()`,'visible static profile before activation');
      await evaluate(cdp, sessionId, `document.querySelector('[data-profile-animation]').click()`);
      try {
        await waitExpression(cdp,sessionId,`document.querySelector('[data-profile-animation]').dataset.profileState==='playing'`,'explicit profile playback');
      } catch (error) {
        console.error('profile diagnostics',await evaluate(cdp,sessionId,`(()=>{const b=document.querySelector('[data-profile-animation]'),i=b.querySelector('img'),r=b.getBoundingClientRect();return {state:b.dataset.profileState,error:b.dataset.profileError,src:i.currentSrc,complete:i.complete,naturalWidth:i.naturalWidth,hidden:document.hidden,rect:{top:r.top,bottom:r.bottom},resources:performance.getEntriesByType('resource').filter(x=>x.name.includes('mouse_surprised')).map(x=>({url:x.name,bytes:x.transferSize,duration:x.duration}))}})()`));
        throw error;
      }
      await waitExpression(cdp,sessionId,`document.querySelector('[data-profile-animation]').dataset.profileState==='static'`,'one-shot profile returns to static');
      const activated = await evaluate(cdp,sessionId,`performance.getEntriesByType('resource').map(r=>({url:r.name,bytes:r.transferSize,duration:r.duration}))`);
      assert(activated.some(r=>r.url.includes('/writing-graph/')));
      assert(activated.some(r=>r.url.includes('mouse_surprised-once.webp')));
      assert(!activated.some(r=>r.url.includes('/image/mouse_surprised.gif')));
      // Offscreen changes are queued, not drawn; scrolling back flushes them.
      await evaluate(cdp,sessionId,`(() => {
        const spacer=document.createElement('div');spacer.dataset.perfSpacer='true';
        spacer.style.height='200vh';document.body.append(spacer);window.scrollTo(0,document.documentElement.scrollHeight);
      })()`);
      await waitExpression(cdp,sessionId,`document.querySelector('[data-experience-canvas]').getBoundingClientRect().bottom<=0`,'graph exits viewport');
      await sleep(300);
      const offscreen = await evaluate(cdp,sessionId,'window.__asciiDraws');
      await evaluate(cdp,sessionId,`document.documentElement.classList.toggle('dark')`);
      await sleep(500);
      assert.equal(await evaluate(cdp,sessionId,'window.__asciiDraws'),offscreen,'Offscreen graph must not draw');
      await evaluate(cdp,sessionId,`document.querySelector('[data-perf-spacer]').remove();document.querySelector('[data-experience-canvas]').scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp,sessionId,`window.__asciiDraws > ${offscreen}`,'queued offscreen update is painted on return');
      const target = await evaluate(cdp, sessionId, `(() => {
        window.__sampleAtlas=true;
        const data=window.__atlasPayload, categories=new Map(data.nodes.map(n=>[n.id,n.category]));
        const cross=data.edges.find(e=>categories.get(e.source ?? e[0])!==categories.get(e.target ?? e[1]));
        const a=document.querySelector('[data-post-graph-node="'+CSS.escape(cross.source ?? cross[0])+'"]');
        a.focus(); return a.getAttribute('href');
      })()`);
      await waitExpression(cdp, sessionId, "document.querySelector('[data-post-graph-tooltip]').hasAttribute('data-visible') && document.querySelector('[data-experience-canvas]').dataset.graphFocused===document.activeElement.dataset.postGraphNode", 'keyboard graph tooltip');
      await checkAtlasPaint('Keyboard focus');
      const relation = await evaluate(cdp,sessionId,`(() => {
        const host=document.querySelector('[data-experience-canvas]'), id=host.dataset.graphFocused, data=window.__atlasPayload;
        const incident=data.edges.filter(e=>Array.isArray(e)?e[0]===id||e[1]===id:e.source===id||e.target===id);
        const others=new Set(incident.map(e=>Array.isArray(e)?(e[0]===id?e[1]:e[0]):(e.source===id?e.target:e.source)));
        return {edges:Number(host.dataset.graphHighlightedEdges),neighbors:Number(host.dataset.graphNeighborCount),expected:incident.length,expectedNeighbors:others.size,legend:document.querySelectorAll('[data-graph-category]').length,categories:new Set(data.nodes.map(n=>n.category)).size};
      })()`);
      assert.equal(relation.edges,relation.expected);
      assert.equal(relation.neighbors,relation.expectedNeighbors);
      assert.equal(relation.legend,relation.categories);
      await cdp.send('Input.dispatchKeyEvent', { type:'rawKeyDown', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 }, sessionId);
      await cdp.send('Input.dispatchKeyEvent', { type:'keyUp', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 }, sessionId);
      const path = new URL(target, BASE).pathname;
      await waitExpression(cdp, sessionId, `${JSON.stringify([path, path.endsWith('/') ? path.slice(0,-1) : path+'/'])}.includes(location.pathname)`, 'native graph link destination');
      results.push({width,route,cold,idleDraws:after-before,rotationDraws,graphLinks:counts.actual,nativeLink:true,autoLoaded:true,relation,activated});
      console.log('mobile-performance: graph/profile PASS '+JSON.stringify({width,route,idleDraws:after-before,links:counts.actual}));
    }
  }
  await viewport(cdp,sessionId,{width:390,height:844,mobile:true,touch:true,reduced:true});
  await navigate(cdp,sessionId,'/');
  await evaluate(cdp,sessionId,`document.querySelector('[data-profile-animation]').scrollIntoView({block:'center',behavior:'instant'})`);
  await waitExpression(cdp,sessionId,`document.querySelector('[data-profile-animation]').disabled`,'reduced motion disables profile playback');
  await evaluate(cdp,sessionId,`document.querySelector('[data-profile-animation]').click()`);
  assert.equal(await evaluate(cdp,sessionId,`document.querySelector('[data-profile-animation]').dataset.profileState`),'static');
  assert(!await evaluate(cdp,sessionId,`performance.getEntriesByType('resource').some(r=>r.name.includes('mouse_surprised-once.webp'))`));
  await evaluate(cdp,sessionId,`document.querySelector('[data-experience-canvas]').scrollIntoView({block:'center',behavior:'instant'})`);
  await waitExpression(cdp,sessionId,"typeof window.__releaseAtlas==='function'",'reduced motion still auto-loads graph');
  await evaluate(cdp,sessionId,'window.__releaseAtlas(false)');
  await waitExpression(cdp,sessionId,"document.querySelector('[data-experience-canvas]').dataset.graphState==='ready'",'reduced-motion graph ready');
  const reducedPosition = await evaluate(cdp,sessionId,"document.querySelector('[data-post-graph-node]').style.translate");
  await evaluate(cdp,sessionId,"document.querySelector('[data-graph-rotate=\"1\"]').click()");
  await waitExpression(cdp,sessionId,"document.querySelector('[data-post-graph-node]').style.translate!=="+JSON.stringify(reducedPosition),'reduced-motion rotation applies');
  assert.equal(await evaluate(cdp,sessionId,"document.querySelector('[data-experience-canvas]').dataset.graphMotion"),'still');
  const reducedDraws=await evaluate(cdp,sessionId,'window.__asciiDraws');
  await sleep(350);
  assert.equal(await evaluate(cdp,sessionId,'window.__asciiDraws'),reducedDraws,'Reduced motion must not animate after rotation');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: false }, sessionId);
  await viewport(cdp, sessionId, { width:390, height:844, mobile:true, touch:true, reduced:false });
  await navigate(cdp, sessionId, '/news/');
  await waitExpression(cdp, sessionId, `(() => {const img=document.querySelector('[data-news-card] img');return img?.complete && img.naturalWidth>0})()`, 'first NEWS thumbnail');
  const news = await evaluate(cdp, sessionId, `(() => {
    const cards=[...document.querySelectorAll('[data-news-card]')];
    const rows=cards.map(card=>{const f=card.querySelector('[data-news-figure]'),i=f?.querySelector('img');return {
      slug:card.dataset.newsCard,preview:f?.dataset.previewSrc,original:i?.dataset.originalSrc,src:i?.getAttribute('src'),
      link:f?.querySelector('a.news-figure__image')?.getAttribute('href'),current:i?.currentSrc,
      declaredWidth:Number(i?.getAttribute('width')),declaredHeight:Number(i?.getAttribute('height')),
      width:i?.naturalWidth,height:i?.naturalHeight,expectedWidth:Number(f?.dataset.previewWidth),expectedHeight:Number(f?.dataset.previewHeight),
      loading:i?.loading,priority:i?.fetchPriority};});
    return {url:location.href,timeOrigin:performance.timeOrigin,rows,overflow:document.documentElement.scrollWidth>innerWidth+2,
      resources:performance.getEntriesByType('resource').map(r=>({url:r.name,bytes:r.transferSize,initiator:r.initiatorType,start:r.startTime,duration:r.duration}))};
  })()`);
  fs.writeFileSync(`${out}/news-network.json`,JSON.stringify(news,null,2));
  assert(!news.overflow);
  assert(news.rows.length > 0 && news.rows[0].preview);
  assert.equal(news.rows[0].loading, 'eager'); assert.equal(news.rows[0].priority, 'high');
  assert.equal(news.rows.filter(r=>r.loading==='eager').length, 1);
  for (const row of news.rows) {
    if (!row.src) continue;
    assert(row.original, 'Every image retains its original provenance URL');
    assert.equal(row.link, row.original, 'Enlargement still opens the unmodified original');
    assert.equal(row.src, row.preview ?? row.original);
    if (row.preview) {
      assert.equal(row.expectedWidth, Math.min(640,row.declaredWidth));
      assert(Math.abs(row.expectedHeight-row.declaredHeight*row.expectedWidth/row.declaredWidth)<=1);
      const unexpected = news.resources.filter(r=>r.url===new URL(row.original,BASE).href);
      assert.equal(unexpected.length,0, 'NEWS must not fetch thumbnail originals: '+JSON.stringify({row,requests:unexpected}));
    }
  }
  assert.equal(news.rows[0].width,news.rows[0].expectedWidth);
  assert.equal(news.rows[0].height,news.rows[0].expectedHeight);
  await capture('news-mobile');
  results.push({ newsCards:news.rows.length, thumbnails:news.rows.filter(r=>r.preview).length, initialResources:news.resources });
  fs.writeFileSync(`${out}/browser.json`,JSON.stringify({base:BASE,results},null,2));
  console.log('mobile-performance: PASS '+JSON.stringify(results));
} catch (error) {
  console.error(error); process.exitCode=1;
  fs.writeFileSync(`${out}/failure.json`,JSON.stringify({error:String(error),results},null,2));
  if(cdp&&sessionId) await capture('failure').catch(()=>{});
} finally {
  cdp?.close(); await stopChild(chrome?.child,'SIGKILL'); await stopChild(preview,'SIGTERM');
  removeProfile(chrome?.profile); clearTimeout(hardStop);
  // Match the other standalone suites: pnpm's preview descendants can retain
  // pipe handles after its parent exits. Never let those handles hide a verdict.
  process.exit(process.exitCode || 0);
}
