import { evaluate, waitExpression } from './browser-smoke-harness.mjs';

export async function checkEnglishInteractivePage({cdp,sessionId,slug,enter,width}) {
  const charts = {
    '2025-05-20-2025-05-20': ['caffeineContentChart','sleepQualityChart','neuroProtectionChart'],
    '2025-08-06-2025-08-06': ['nutrientChart'],
    '2025-06-27-2025-06-27': ['bioavailabilityChart','priceChart'],
    '2025-07-23-2025-07-23': ['vitaminBChart'],
    '2025-07-23-2025-07-23-2': ['absorptionChart'],
  };
  if (charts[slug]) {
    await waitExpression(cdp,sessionId,`typeof Chart === 'function'`,'English chart dependency loaded');
    if (slug === '2025-06-27-2025-06-27') {
      await enter('button.tab-button[data-tab="types"]');
      await enter('button.type-selector[data-type="citrate"]');
      await waitExpression(cdp,sessionId,`document.querySelector('#type-details').innerText.includes('Magnesium citrate') && Chart.getChart('bioavailabilityChart')?.data.datasets[0].data[0] === 50`,'Native magnesium form updates text and chart');
    }
    if (slug === '2025-07-23-2025-07-23') await enter('#tab-nav button[data-tab="comparison"]');
    for (const id of charts[slug]) {
      await waitExpression(cdp,sessionId,`Boolean(Chart.getChart(${JSON.stringify(id)})?.data.datasets.length)`,'English '+id+' initialized');
    }
    console.log('english-interactive: PASS '+JSON.stringify({slug,width,charts:charts[slug],magnesiumSelection:slug==='2025-06-27-2025-06-27'}));
  }
  if (slug === '2024-03-17-english-word') {
    await enter('#start-quiz');
    await waitExpression(cdp,sessionId,`document.querySelector('#study-section').hidden || getComputedStyle(document.querySelector('#study-section')).display === 'none'`,'Hide vocabulary list while answering');
    for (let i = 0; i < 10; i++) {
      await enter('#options-container button');
      await waitExpression(cdp,sessionId,`document.querySelectorAll('#options-container button:disabled').length === 4`,'Record one answer per question');
      await enter('#next-btn');
    }
    await waitExpression(cdp,sessionId,`document.querySelector('#final-score').innerText.includes('Your score')`,'Show vocabulary quiz result');
    await enter('#final-score button');
    await waitExpression(cdp,sessionId,`document.querySelector('#current-question').textContent === '1' && document.querySelectorAll('#options-container button:enabled').length === 4`,'Restart vocabulary quiz');
    await enter('#return-study');
  }
  if (slug === 'isaiah-43-18-21-3') {
    const doc=`document.querySelector('iframe[src*="isaiah-dashboard-3"]').contentDocument`;
    await waitExpression(cdp,sessionId,`Boolean(${doc}?.querySelector('#globalSearch'))`,'Isaiah English search ready');
    for (const [query,tab] of [['Memory','tab2'],['mEmOrY','tab2'],['Exodus','tab2'],['EXODUS','tab2'],['Trauma','tab3'],['tRaUmA','tab3']]) {
      await evaluate(cdp,sessionId,`(()=>{const i=${doc}.querySelector('#globalSearch');i.scrollIntoView({block:'center'});i.focus();i.select()})()`);
      await cdp.send('Input.insertText',{text:query},sessionId);
      await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
      await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
      await waitExpression(cdp,sessionId,`${doc}.querySelector('#nav-${tab}').classList.contains('active') && !${doc}.querySelector('#${tab}').classList.contains('hidden')`,'Native Isaiah '+query+' search selects '+tab);
    }
    console.log('english-interactive: PASS '+JSON.stringify({slug,width,nativeKeywordSearches:6}));
  }
}
