import { auditNativeActsInteractions, auditActsTypography } from './browser-acts-native-audit.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { getActsDashboardHtml } from '../src/lib/acts-dashboard-source.mjs';
import { BASE, evaluate, navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

const series = JSON.parse(fs.readFileSync(new URL('../src/data/acts-series.json', import.meta.url), 'utf8'));
const slugs = series.entries.map((entry) => entry.slug);
const sizes = [
  { width: 320, height: 800, mobile: true, touch: true, reduced: true },
  { width: 390, height: 844, mobile: true, touch: true, reduced: true },
  { width: 1440, height: 1000, reduced: true },
];
const sourceValues = {
  overviewChart: [[25, 18, 29, 28]],
  gradeOverviewChart: [[13, 6, 1, 3, 2]],
  domainReliabilityChart: [[9.8, 9.9, 9.5, 9, 6.5, 7.5, 7, 1]],
  theologyRadarChart: [[95, 30, 20, 85, 95, 40], [70, 50, 95, 60, 50, 30], [40, 95, 30, 40, 40, 50]],
  consensusDoughnutChart: [[25, 40, 35]],
};
const digest = (value) => createHash('sha256').update(value).digest('hex');
const inFrame = (code) => `(() => { const f=document.querySelector('[data-acts-frame]'); const w=f.contentWindow; const d=f.contentDocument; ${code} })()`;

async function pressKey(cdp, sessionId, key, number, text) {
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: number, ...(text ? { text, unmodifiedText: text } : {}) }, sessionId);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: number }, sessionId);
}
async function originalToggle(cdp, sessionId, entry) {
  assert.equal(await evaluate(cdp, sessionId, `document.querySelector('[data-acts-original]').open`), false);
  await evaluate(cdp, sessionId, `(() => {const s=document.querySelector('[data-acts-original] summary');s.scrollIntoView({block:'center',behavior:'instant'});s.focus();})()`);
  assert(await evaluate(cdp, sessionId, `document.activeElement===document.querySelector('[data-acts-original] summary')`));
  await pressKey(cdp, sessionId, 'Enter', 13, '\r');
  await waitExpression(cdp, sessionId, `document.querySelector('[data-acts-original]').open`, `${entry.slug}: Enter opens source`);
  assert.equal(await evaluate(cdp, sessionId, `document.querySelector('[data-acts-source]').href`), entry.source);
  await pressKey(cdp, sessionId, 'Enter', 13, '\r');
  await waitExpression(cdp, sessionId, `!document.querySelector('[data-acts-original]').open`, `${entry.slug}: Enter closes source`);
}
async function waitDashboard(cdp, sessionId) {
  await evaluate(cdp, sessionId, `document.querySelector('[data-acts-frame]').scrollIntoView({block:'center',behavior:'instant'})`);
  await waitExpression(cdp, sessionId, `document.querySelector('jjo-acts-dashboard')?.dataset.ready==='true' && (document.querySelector('[data-acts-frame]')?.contentDocument?.documentElement?.dataset.nativeReady==='true'||document.querySelector('[data-acts-frame]')?.contentDocument?.querySelectorAll('canvas[data-chart-engine]').length>0)`, 'Restored dashboard and charts initialize');
}
async function chartCheck(cdp, sessionId, order) {
  const expectedCount = order === 1 ? 1 : 2;
  const charts = await evaluate(cdp, sessionId, inFrame(`return [...d.querySelectorAll('canvas')].map(c=>({id:c.id,engine:c.dataset.chartEngine,values:JSON.parse(c.dataset.sourceChartValues||'null')}));`));
  assert.equal(charts.length, expectedCount, 'Original chart count preserved');
  for (const chart of charts) {
    assert(['chartjs', 'offline-canvas'].includes(chart.engine), `${chart.id}: chart actually initialized`);
    assert.deepEqual(chart.values, sourceValues[chart.id], `${chart.id}: original numbers, not substitute counts`);
  }
  // Wait for non-empty drawing, rather than accepting a canvas element alone.
  await waitExpression(cdp, sessionId, inFrame(`const c=[...d.querySelectorAll('canvas')].find(c=>c.getBoundingClientRect().width>0&&c.getBoundingClientRect().height>0); if(!c||!c.width||!c.height)return false;return c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0);`), 'Visible chart is drawn');
  console.log(`acts-charts: PASS overview-${order} ${charts.map(c=>c.id+'='+c.engine).join(',')}`);
}
async function dashboardInteractions(cdp, sessionId, order) {
  if (order <= 2) {
    const panels = order === 1 ? ['overview','narrative','matrix','literary','paul','debates','concept'] : ['overview','chronology','rulers','archaeology','matrix','paul','speeches','textual','voyage','verdict'];
    for (const tab of panels) {
      const button = order === 1 ? `tab-${tab}` : `btn-tab-${tab}`;
      const panel = order === 1 ? `sec-${tab}` : `tab-${tab}`;
      assert(await evaluate(cdp, sessionId, inFrame(`d.getElementById(${JSON.stringify(button)}).click();return !d.getElementById(${JSON.stringify(panel)}).classList.contains('hidden') && d.documentElement.scrollWidth<=w.innerWidth+2;`)), `Tab opens ${panel}`);
    }
  }
  if (order === 1) {
    const result = await evaluate(cdp, sessionId, inFrame(`
      w.switchTab('matrix');const input=d.getElementById('matrixSearch'),select=d.getElementById('regionFilter');
      input.value='___no-match-acts___';w.filterMatrix();const empty=d.querySelectorAll('#matrixTbody tr').length;
      input.value='';select.value='Rome';w.filterMatrix();const regional=d.querySelectorAll('#matrixTbody tr').length;
      input.value='Acts 28';w.filterMatrix();const rows=[...d.querySelectorAll('#matrixTbody tr')];rows[0].querySelector('button').click();
      return {empty,regional,count:rows.length,title:d.getElementById('modalTitle').textContent,open:!d.getElementById('detailModal').classList.contains('hidden')};`));
    assert.equal(result.empty, 0); assert.equal(result.regional, 2); assert.equal(result.count, 1); assert(result.title.startsWith('Acts 28 ')); assert(result.open);
    await pressKey(cdp, sessionId, 'Escape', 27);
    await waitExpression(cdp, sessionId, inFrame(`return d.getElementById('detailModal').classList.contains('hidden');`), 'Chapter modal closes with Escape');
    const counts = await evaluate(cdp, sessionId, inFrame(`d.getElementById('matrixSearch').value='';d.getElementById('regionFilter').value='all';w.filterMatrix();w.switchTab('debates');w.filterDebates('Moderate');const debates=d.getElementById('debatesContainer').children.length;w.filterDebates('all');w.switchTab('overview');return {chapters:d.querySelectorAll('#matrixTbody tr').length,debates,all:d.getElementById('debatesContainer').children.length};`));
    assert.deepEqual(counts, {chapters:19,debates:3,all:10});
  } else if (order === 2) {
    const chronology = await evaluate(cdp, sessionId, inFrame(`w.switchTab('tab-chronology');return d.getElementById('tab-chronology').textContent;`));
    for (const text of ['51 CE 5월 ~ 52 CE 4월','비문 문구','연대 계산 산식','사도행전 18장 적용','티베리우스','칼리굴라','클라우디우스','네로']) assert(chronology.includes(text), `Restored chronology card: ${text}`);
    const result = await evaluate(cdp, sessionId, inFrame(`w.switchTab('tab-matrix');const input=d.getElementById('matrixSearch'),select=d.getElementById('gradeFilter');select.value='D';w.filterMatrix();const gradeD=d.querySelectorAll('#matrixTableBody tr').length;select.value='ALL';input.value='갈리오';w.filterMatrix();const rows=d.querySelectorAll('#matrixTableBody tr');return {gradeD,count:rows.length,claim:rows[0].textContent};`));
    assert.equal(result.gradeD,2); assert.equal(result.count,1); assert(result.claim.includes('갈리오'));
    // Filtering replaces rows; wait for the source's observer to install native keyboard access.
    await waitExpression(cdp, sessionId, inFrame(`return d.querySelector('#matrixTableBody tr')?.dataset.keyboard==='1';`), 'Filtered case row keyboard ready');
    assert(await evaluate(cdp, sessionId, inFrame(`const row=d.querySelector('#matrixTableBody tr');row.scrollIntoView({block:'center',behavior:'instant'});row.focus();return d.activeElement===row;`)), 'Filtered row receives keyboard focus');
    await pressKey(cdp, sessionId, 'Enter', 13, '\r');
    await waitExpression(cdp, sessionId, inFrame(`return !d.getElementById('caseModal').classList.contains('hidden') && d.getElementById('modalTitle').textContent.includes('갈리오');`), 'Keyboard opens filtered Gallio case');
    await pressKey(cdp, sessionId, 'Escape', 27);
    await waitExpression(cdp, sessionId, inFrame(`return d.getElementById('caseModal').classList.contains('hidden');`), 'Case modal Escape');
    const counts = await evaluate(cdp, sessionId, inFrame(`const input=d.getElementById('matrixSearch');input.value='___no-match-acts___';w.filterMatrix();const empty=d.querySelectorAll('#matrixTableBody tr').length;input.value='';w.filterMatrix();w.switchTab('tab-verdict');return {empty,all:d.querySelectorAll('#matrixTableBody tr').length};`));
    assert.deepEqual(counts,{empty:0,all:25});
  } else {
    const result = await evaluate(cdp, sessionId, inFrame(`
      d.getElementById('btn-tier-grad').click();const graduate=d.getElementById('tier-content-box').textContent.includes('Graduate Seminar');
      const points=d.querySelectorAll('#tp-buttons-container button');points[9].click();const point=d.getElementById('tp-detail-box').textContent.includes('전환점 #10');
      d.querySelectorAll('#matrix-filter-buttons button')[3].click();const filtered=d.querySelectorAll('#matrix-table-body tr').length;
      d.querySelectorAll('#matrix-filter-buttons button')[0].click();const all=d.querySelectorAll('#matrix-table-body tr').length;
      const input=d.getElementById('scholar-search');input.value='Keener';input.dispatchEvent(new w.Event('input',{bubbles:true}));const scholars=d.getElementById('scholars-grid').children.length;input.value='';w.searchScholars();
      const questions=d.getElementById('q-search');questions.value='___no-match-acts___';w.searchQuestions();const empty=d.getElementById('synthesis-accordion-container').children.length;
      questions.value='Paul은 Judaism';w.searchQuestions();d.querySelector('#synthesis-accordion-container button').click();const answer=d.getElementById('acc-content-0');const opened=!answer.classList.contains('hidden')&&answer.textContent.includes('유대인');questions.value='';w.searchQuestions();
      d.getElementById('hb-council').click();return {graduate,point,points:points.length,filtered,all,scholars,empty,opened,questions:d.getElementById('synthesis-accordion-container').children.length,herm:d.getElementById('herm-display-box').textContent.includes('공의회')};`));
    assert.deepEqual(result,{graduate:true,point:true,points:10,filtered:3,all:9,scholars:1,empty:0,opened:true,questions:14,herm:true});
  }
  await chartCheck(cdp, sessionId, order);
  await auditActsTypography(cdp, sessionId, order);
}

export async function auditActsStudies(cdp, sessionId) {
  assert.equal(series.entries.length, 9);
  assert.deepEqual(series.entries.map(entry=>entry.order), [1,2,3,4,5,6,7,8,9]);
  for (const entry of series.entries) {
    const source = fs.readFileSync(new URL(`../site/content/posts/${entry.slug}.mdx`, import.meta.url), 'utf8');
    const response = await fetch(new URL(`/posts/${entry.slug}`, BASE), {cache:'no-store'});
    assert.equal(response.status, 200, entry.slug);
    const html = await response.text();
    assert(html.includes(entry.source), `Original source link: ${entry.slug}`);
    assert(!html.includes('cdn.tailwindcss.com'));
    assert(!html.includes('cdn.jsdelivr.net/npm/chart.js'), 'Chart runtime must remain inside dashboard document, not the site shell');
    const original = html.match(/<details[^>]*data-acts-original[^>]*>/)?.[0];
    assert(original && !/\sopen(?:\s|=|>)/.test(original), 'Original closed by default');
    assert(source.includes('ActsDashboard'));
    assert(!html.includes('원자료의 비율 표기와 편집 범위'));
    const route=`/assets/interactive/${entry.slug}.html`;
    assert(html.includes(route) && html.includes('data-acts-frame'));
    const asset=await fetch(new URL(route,BASE),{cache:'no-store'});
    assert.equal(asset.status,200);
    const restored=await asset.text();
    assert(restored.length>20000);
    assert.equal(digest(restored),digest(getActsDashboardHtml(entry.order)), 'Public HTML matches deterministic source adapter');
    assert(!restored.includes('src="https://cdn.tailwindcss.com'));
    console.log(`acts-source: PASS ${asset.url} SHA256=${digest(restored)}`);
    console.log(`acts-route: PASS HTTP ${response.status} ${response.url}`);
  }
  for (const size of sizes) {
    await viewport(cdp, sessionId, size);
    for (const route of ['/bible','/posts']) {
      await navigate(cdp,sessionId,route);
      assert.deepEqual(await evaluate(cdp,sessionId,`[...document.querySelectorAll('[data-acts-card]')].map(n=>n.dataset.actsCard)`),slugs);
    }
    for (const entry of series.entries) {
      await navigate(cdp,sessionId,`/posts/${entry.slug}`);
      await waitDashboard(cdp,sessionId);
      await originalToggle(cdp,sessionId,entry);
      for(const dark of [false,true]) {
        await evaluate(cdp,sessionId,`document.documentElement.classList.toggle('dark',${dark})`);
        if(entry.order<=3) {
          await waitExpression(cdp,sessionId,inFrame(`return d.documentElement.classList.contains('dark')===${dark};`),'Parent theme reaches dashboard');
          const state=await evaluate(cdp,sessionId,inFrame(`return {outer:document.documentElement.scrollWidth>innerWidth+2,inner:d.documentElement.scrollWidth>w.innerWidth+2,theme:w.getComputedStyle(d.body).backgroundColor===getComputedStyle(document.querySelector('[data-acts-frame]')).backgroundColor};`));
          assert.deepEqual(state,{outer:false,inner:false,theme:true},`${entry.slug} width=${size.width} dark=${dark}`);
          await dashboardInteractions(cdp,sessionId,entry.order);
        } else {
          await waitExpression(cdp,sessionId,inFrame(`return d.documentElement.classList.contains('dark')===${dark};`),'Theme reaches native source');
          assert.equal(await evaluate(cdp,sessionId,`document.documentElement.scrollWidth>innerWidth+2`),false);
          await auditNativeActsInteractions(cdp,sessionId,entry.order);
          if(dark) assert.equal(await evaluate(cdp,sessionId,inFrame(`return w.getComputedStyle(d.body).backgroundColor;`)),'rgb(28, 33, 29)');
        }
        assert.equal(await evaluate(cdp,sessionId,`document.querySelector('[data-acts-original]').open`),false);
      }
      console.log(`acts-reader: PASS ${entry.slug} width=${size.width} light/dark keyboard source and interactions`);
    }
  }
  await navigate(cdp,sessionId,'/posts/acts-overview-1');
  await evaluate(cdp,sessionId,`document.querySelector('a[href="/posts/acts-overview-2"]').click()`);
  await waitExpression(cdp,sessionId,`location.pathname.split('/').filter(Boolean).join('/')==='posts/acts-overview-2'&&Boolean(document.querySelector('[data-acts-frame]'))`,'Astro navigation reaches next dashboard');
  await waitDashboard(cdp,sessionId);await dashboardInteractions(cdp,sessionId,2);
  // Also retain a client-navigation regression for the original passage dashboard.
  await navigate(cdp,sessionId,'/posts/acts-1-1-5-1');
  await evaluate(cdp,sessionId,`document.querySelector('a[href="/posts/acts-1-1-5-2"]').click()`);
  await waitExpression(cdp,sessionId,`location.pathname.split('/').filter(Boolean).join('/')==='posts/acts-1-1-5-2'&&Boolean(document.querySelector('[data-acts-frame]'))`,'Astro navigation initializes original passage dashboard');
  await waitDashboard(cdp,sessionId);
  await auditNativeActsInteractions(cdp,sessionId,5);
  console.log('acts-study-qa: PASS 9 original dashboards, 22 charts with original source values and fonts, ordered shelves, three viewports x two themes, native originals, modals, filters and client navigation');
}
