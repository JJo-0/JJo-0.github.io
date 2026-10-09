import assert from 'node:assert/strict';
import { evaluate, waitExpression } from './browser-smoke-harness.mjs';

const frame = (code) =>
  `(() => { const f=document.querySelector('[data-acts-frame]'); const w=f.contentWindow,d=f.contentDocument; ${code} })()`;
const expected = {
  4: {
    glossaryPosChart: [[7, 10, 1, 2]],
    textualConfidenceChart: [[95, 88, 92, 98]],
    compositionChart: [[75, 80, 95, 55, 35]],
    kingdomProgressionChart: [[1, 2, 4, 5, 6, 6.5, 8]],
  },
  5: {
    boundaryScopeChart: [[1, 2, 5, 8, 11, 14, 26, 73]],
    chronotopeChart: [[80, 40, 30, 90, 100]],
    agencyRadarChart: [
      [95, 100, 95, 85],
      [30, 10, 20, 40],
      [20, 30, 90, 100],
    ],
    performanceTensionChart: [[30, 45, 65, 85, 100]],
  },
  6: {
    pneumatologyChart: [
      [65, 50, 70, 90, 75],
      [85, 95, 75, 60, 80],
      [90, 85, 95, 80, 85],
      [95, 90, 90, 95, 90],
    ],
  },
  7: {
    modelRadarChart: [
      [40, 50, 60, 45],
      [95, 90, 85, 95],
      [90, 95, 80, 85],
    ],
    geographicChart: [[7, 5, 16]],
  },
  8: {
    boundaryChart: [[60, 75, 98, 50, 65]],
    temporalChart: [
      [95, 20, 80, 30, 40],
      [20, 100, 90, 100, 90],
    ],
  },
  9: {
    claimAuditChart: [[1.5, 2, 1.8, 3.5, 8.5]],
    witnessEvolutionChart: [
      [95, 85, 50, 30, 20],
      [10, 35, 85, 95, 90],
    ],
    boundaryChart: [
      [10, 10, 95, 90],
      [45, 85, 90, 75],
      [100, 95, 70, 85],
    ],
    receptionChart: [[35, 25, 25, 15]],
  },
};
const typography = {
  1: ['ui-sans-serif', 'ui-sans-serif'],
  2: ['system-ui', 'Georgia'],
  3: ['system-ui', 'system-ui'],
  4: ['Noto Sans KR', 'Noto Serif KR'],
  5: ['-apple-system', '-apple-system'],
  6: ['Sans Serif KR', 'Noto Serif KR'],
  7: ['Noto Sans KR', 'Noto Serif KR'],
  8: ['Noto Sans KR', 'Noto Serif KR'],
  9: ['system-ui', 'system-ui'],
};
const firstFamily = (s) =>
  s
    .split(',')[0]
    .trim()
    .replace(/^["']|["']$/g, '');
export async function auditActsTypography(cdp, sessionId, order) {
  const fonts = await evaluate(
    cdp,
    sessionId,
    frame(
      `await d.fonts.ready;return {body:w.getComputedStyle(d.body).fontFamily,heading:w.getComputedStyle(d.querySelector('h1')).fontFamily,greek:(()=>{const e=d.querySelector('.greek-text,.greek-font');return e?w.getComputedStyle(e).fontFamily:null})(),loaded:[...d.fonts].filter(f=>f.status==='loaded').map(f=>f.family.replace(/['"]/g,''))};`
    ).replace('(() =>', '(async () =>')
  );
  assert.equal(firstFamily(fonts.body), typography[order][0], `Source body font ${order}`);
  assert.equal(firstFamily(fonts.heading), typography[order][1], `Source heading font ${order}`);
  assert(
    !/Iowan|Nanum Myeongjo|Outfit/.test(fonts.body + fonts.heading),
    'Site font override must not enter the dashboard'
  );
  if ([4, 7].includes(order)) assert.equal(firstFamily(fonts.greek), 'Times New Roman');
  if ([4, 6, 7, 8].includes(order))
    assert(
      fonts.loaded.includes('Noto Serif KR'),
      `Real source Noto Serif webfont loaded ${order}`
    );
  if ([4, 7, 8].includes(order))
    assert(fonts.loaded.includes('Noto Sans KR'), `Real source Noto Sans webfont loaded ${order}`);
  console.log(
    `acts-font: PASS order=${order} body=${firstFamily(fonts.body)} heading=${firstFamily(fonts.heading)}`
  );
}
async function pressEnter(cdp, sessionId) {
  await cdp.send(
    'Input.dispatchKeyEvent',
    { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' },
    sessionId
  );
  await cdp.send(
    'Input.dispatchKeyEvent',
    { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 },
    sessionId
  );
}
async function allTabs(cdp, sessionId) {
  const ids = await evaluate(
    cdp,
    sessionId,
    frame(`return [...d.querySelectorAll('section.tab-content')].map(e=>e.id);`)
  );
  for (const id of ids) {
    const opened = await evaluate(
      cdp,
      sessionId,
      frame(
        `const id=${JSON.stringify(id)};const b=[...d.querySelectorAll('button[onclick]')].find(b=>b.getAttribute('onclick').includes("'"+id+"'"));if(!b)return false;b.click();return !d.getElementById(id).classList.contains('hidden');`
      )
    );
    assert(opened, `Source tab ${id}`);
    assert(
      await evaluate(
        cdp,
        sessionId,
        frame(`return d.documentElement.scrollWidth<=w.innerWidth+2;`)
      ),
      `Native tab overflow ${id}`
    );
  }
}
async function checkCharts(cdp, sessionId, order) {
  assert.deepEqual(
    await evaluate(
      cdp,
      sessionId,
      frame(`return [...d.querySelectorAll('canvas')].map(c=>c.id).sort();`)
    ),
    Object.keys(expected[order]).sort()
  );
  for (const [id, values] of Object.entries(expected[order])) {
    await evaluate(
      cdp,
      sessionId,
      frame(
        `const c=d.getElementById(${JSON.stringify(id)}),section=c.closest('.tab-content,.narrative-tab-content');if(section&&section.classList.contains('hidden')){const b=[...d.querySelectorAll('button[onclick]')].find(b=>b.getAttribute('onclick').includes("'"+section.id+"'"));b.click();}c.scrollIntoView({block:'center',behavior:'instant'});`
      )
    );
    await waitExpression(
      cdp,
      sessionId,
      frame(
        `const c=d.getElementById(${JSON.stringify(id)});if(!c||c.dataset.chartEngine!=='chartjs'||c.getBoundingClientRect().width<10||c.height<10)return false;return c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0);`
      ),
      `Native chart actual drawing: ${id}`
    );
    const result = await evaluate(
      cdp,
      sessionId,
      frame(
        `const chart=w.Chart.getChart(d.getElementById(${JSON.stringify(id)}));return {values:chart.data.datasets.map(s=>s.data),fonts:[chart.options.plugins?.legend?.labels?.font?.family,chart.options.scales?.r?.pointLabels?.font?.family].filter(Boolean)};`
      )
    );
    assert.deepEqual(result.values, values, `Unmodified chart values ${order}/${id}`);
    assert(
      !/Iowan|Nanum Myeongjo|Outfit/.test(result.fonts.join(' ')),
      'Original chart fonts retained'
    );
    console.log(`acts-native-chart: PASS ${order}/${id} actual Chart.js`);
  }
}
export async function auditNativeActsInteractions(cdp, sessionId, order) {
  await allTabs(cdp, sessionId);
  if (order === 4) {
    const state = await evaluate(
      cdp,
      sessionId,
      frame(`
      w.switchTab('tab-greek');const q=d.getElementById('glossary-search'),p=d.getElementById('glossary-pos-filter');
      q.value='___no-match___';w.filterGlossary();const empty=d.getElementById('glossary-list').children.length;
      q.value='';p.value='명사';w.filterGlossary();const nouns=d.getElementById('glossary-list').children.length;p.value='ALL';w.filterGlossary();
      const all=d.getElementById('glossary-list').children.length;
      w.showSyntaxDetail(5);const syntax=d.getElementById('syntax-detail-title').textContent.includes('1:5');
      w.switchTab('tab-composition');const buttons=d.querySelectorAll('#model-buttons button');buttons[4].click();const model=d.getElementById('model-detail-title').textContent.includes('Model E');
      w.switchTab('tab-theology');const nodes=d.querySelectorAll('#kingdom-nodes > div');nodes[6].click();const kingdom=d.getElementById('kingdom-node-detail').textContent.includes('28:31');
      w.switchTab('tab-claims');d.getElementById('claim-filter').value='PNEUMA';w.filterClaims();const filtered=d.querySelectorAll('#claim-tbody tr').length;d.getElementById('claim-filter').value='ALL';w.filterClaims();
      return {empty,nouns,all,syntax,model,models:buttons.length,kingdom,nodes:nodes.length,filtered,claims:d.querySelectorAll('#claim-tbody tr').length,apparatus:d.querySelectorAll('#apparatus-tbody tr').length};`)
    );
    assert.deepEqual(state, {
      empty: 0,
      nouns: 5,
      all: 20,
      syntax: true,
      model: true,
      models: 5,
      kingdom: true,
      nodes: 7,
      filtered: 1,
      claims: 4,
      apparatus: 4,
    });
  } else if (order === 5) {
    const state = await evaluate(
      cdp,
      sessionId,
      frame(`
      const clickArg=(name,arg)=>[...d.querySelectorAll('button[onclick]')].find(b=>b.getAttribute('onclick').includes(name+"('"+arg+"')")).click();
      clickArg('filterBoundary','broad');const broad=d.querySelectorAll('#boundary-table-body tr').length;clickArg('filterBoundary','all');
      clickArg('filterLukeParallel','recap');const recap=d.querySelectorAll('#luke-parallel-tbody tr').length;clickArg('filterLukeParallel','all');
      for(const b of d.querySelectorAll('.narrative-tab-btn'))b.click();
      const q=d.getElementById('rhetoric-search');q.value='___no-match___';w.searchRhetoric();const empty=d.getElementById('rhetoric-grid').children.length;q.value='';w.searchRhetoric();
      for(let i=0;i<4;i++)w.nextVerseStep();const last=d.getElementById('perf-verse-badge').textContent;w.nextVerseStep();const wrap=d.getElementById('perf-verse-badge').textContent;w.prevVerseStep();const back=d.getElementById('perf-verse-badge').textContent;w.nextVerseStep();
      return {broad,boundaries:d.querySelectorAll('#boundary-table-body tr').length,recap,parallel:d.querySelectorAll('#luke-parallel-tbody tr').length,empty,rhetoric:d.getElementById('rhetoric-grid').children.length,scholars:d.getElementById('scholars-grid').children.length,last,wrap,back};`)
    );
    assert.deepEqual(state, {
      broad: 2,
      boundaries: 8,
      recap: 2,
      parallel: 7,
      empty: 0,
      rhetoric: 15,
      scholars: 5,
      last: 'Acts 1:5',
      wrap: 'Acts 1:1',
      back: 'Acts 1:5',
    });
  } else if (order === 6) {
    const state = await evaluate(
      cdp,
      sessionId,
      frame(`
      w.switchTab('tab4');const b=d.querySelectorAll('.rec-filter-btn');b[1].click();const catholic=d.getElementById('reception-container').children.length;b[2].click();const reformed=d.getElementById('reception-container').children.length;b[3].click();const pent=d.getElementById('reception-container').children.length;b[0].click();
      w.switchTab('tab6');const q=d.getElementById('bib-search');q.value='___no-match___';w.searchBib();const empty=[...d.querySelectorAll('#bib-list p')].filter(e=>e.style.display!=='none').length;q.value='Keener';w.searchBib();const keener=[...d.querySelectorAll('#bib-list p')].filter(e=>e.style.display!=='none').length;q.value='';w.searchBib();
      return {memory:d.getElementById('memory-script-container').children.length,catholic,reformed,pent,all:d.getElementById('reception-container').children.length,empty,keener,bib:d.querySelectorAll('#bib-list p').length};`)
    );
    assert.deepEqual(state, {
      memory: 10,
      catholic: 3,
      reformed: 1,
      pent: 2,
      all: 6,
      empty: 0,
      keener: 1,
      bib: 11,
    });
  } else if (order === 7) {
    const state = await evaluate(
      cdp,
      sessionId,
      frame(`
      for(const n of [6,7,8,9,10,12,13])d.getElementById('vbtn-'+n).click();const last=d.getElementById('verse-detail-card').textContent.includes('1:13-14');
      for(const id of ['A','B','C','D','E'])d.getElementById('mdlbtn-'+id).click();const model=d.getElementById('model-detail-container').textContent.includes('E');
      const q=d.getElementById('glossary-search');q.value='___no-match___';w.searchGlossary();const empty=d.getElementById('glossary-grid').textContent.includes('없');q.value='';w.searchGlossary();w.filterGlossary('ecclesiology');const ecclesiology=d.getElementById('glossary-grid').children.length;w.filterGlossary('all');const glossary=d.getElementById('glossary-grid').children.length;
      d.getElementById('mcf-Low').click();const low=d.querySelectorAll('#matrix-table-body tr').length;d.getElementById('mcf-all').click();const claims=d.querySelectorAll('#matrix-table-body tr').length;
      return {last,model,empty,ecclesiology,glossary,low,claims};`)
    );
    assert.deepEqual(state, {
      last: true,
      model: true,
      empty: true,
      ecclesiology: 4,
      glossary: 20,
      low: 1,
      claims: 4,
    });
  } else if (order === 8) {
    const state = await evaluate(
      cdp,
      sessionId,
      frame(`
      for(let i=0;i<5;i++)d.getElementById('model-btn-'+i).click();
      for(const id of ['bridge','boundary','restoration','testcase'])d.getElementById('sam-btn-'+id).click();const samaria=d.getElementById('samaria-content-box').textContent.length>50;
      for(const id of ['A','B','C','D'])d.getElementById('plot-btn-'+id).click();const plot=d.getElementById('plot-model-box').textContent.length>50;
      const q=d.getElementById('bib-search');q.value='___no-match___';w.filterBibliography();const empty=[...d.querySelectorAll('.bib-item')].filter(e=>e.style.display!=='none').length;q.value='';w.filterBibliography();
      const details=[...d.querySelectorAll('#synthesis-reading details')];for(const e of details){e.open=true;if(!e.open)throw Error('Accordion');e.open=false;}
      return {samaria,plot,empty,bib:d.querySelectorAll('.bib-item').length,details:details.length};`)
    );
    assert.deepEqual(state, { samaria: true, plot: true, empty: 0, bib: 12, details: 4 });
    await evaluate(
      cdp,
      sessionId,
      frame(
        `const e=d.querySelector('[onclick="showSceneDetail(5)"]');e.scrollIntoView({block:'center',behavior:'instant'});e.focus();`
      )
    );
    await pressEnter(cdp, sessionId);
    assert(
      await evaluate(
        cdp,
        sessionId,
        frame(`return d.getElementById('scene-detail-box').textContent.includes('기도');`)
      ),
      'Keyboard activates original scene card'
    );
  } else if (order === 9) {
    assert.equal(
      await evaluate(cdp, sessionId, frame(`return d.querySelectorAll('.tab-btn').length;`)),
      7
    );
    assert(
      await evaluate(
        cdp,
        sessionId,
        frame(
          `return d.getElementById('tab7').textContent.includes('10단계')&&d.getElementById('tab6').textContent.includes('ὁμοθυμαδόν');`
        )
      )
    );
  } else throw new Error('Unexpected native dashboard');
  await checkCharts(cdp, sessionId, order);
  await auditActsTypography(cdp, sessionId, order);
  assert(
    await evaluate(cdp, sessionId, frame(`return d.documentElement.scrollWidth<=w.innerWidth+2;`)),
    `Native dashboard ${order} fits viewport`
  );
  console.log(
    `acts-native: PASS order=${order} original tabs, search/filters, data, charts and fonts`
  );
}
