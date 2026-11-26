import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluate, navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

// Explicit fixtures only: no Google account, real token or private report is
// used by this test. It verifies the shipped dashboard's session lifecycle.
export async function auditAnalytics(cdp, sessionId) {
  for (const width of [320, 390, 1440]) {
    await viewport(cdp, sessionId, { width, height: 900, mobile: width < 500, touch: width < 500, reduced: true });
    await navigate(cdp, sessionId, '/analytics/');
    await waitExpression(cdp, sessionId, `!!document.querySelector('[data-analytics-setup]')`, 'Analytics setup guide');
    const publicState = await evaluate(cdp, sessionId, `(() => {
      const root=document.querySelector('[data-analytics-dashboard]'), config=JSON.parse(root.dataset.config);
      return {guide:!!root.querySelector('[data-analytics-security-boundary]'),hidden:root.querySelector('[data-admin-results]').hidden,
        noindex:document.querySelector('meta[name="robots"]')?.content.includes('noindex'),
        disabled:root.querySelector('[data-admin-login]').disabled,unconfigured:!config.clientId||!/^\\d+$/.test(config.propertyId),
        overflow:document.documentElement.scrollWidth>innerWidth+2,forms:root.querySelectorAll('input[type="password"],textarea').length};
    })()`);
    assert(publicState.guide && publicState.hidden && publicState.noindex && !publicState.overflow);
    assert.equal(publicState.forms, 0, 'No secret/key entry form in public HTML');
    if (publicState.unconfigured) assert(publicState.disabled, 'No fake live data before configuration');
    await evaluate(cdp, sessionId, `document.querySelector('[data-analytics-setup]').scrollIntoView({block:'start',behavior:'instant'})`);
    fs.mkdirSync('citation-audit', { recursive: true });
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, sessionId);
    fs.writeFileSync(`citation-audit/analytics-setup-${width}.png`, Buffer.from(shot.data, 'base64'));
  }

  await evaluate(cdp, sessionId, `(() => {
    document.dispatchEvent(new Event('astro:before-swap'));
    const previous=document.querySelector('[data-analytics-dashboard]'),root=previous.cloneNode(true);
    previous.replaceWith(root); delete root.dataset.initialized;
    const config=JSON.parse(root.dataset.config);config.clientId='fixture.apps.googleusercontent.com';config.propertyId='123456';
    root.dataset.config=JSON.stringify(config);
    window.__analyticsTest={requests:[],prompts:[],revoked:0,pending:[],defer:false,lifetime:3600,originalFetch:window.fetch};
    const test=window.__analyticsTest;
    window.google={accounts:{oauth2:{
      initTokenClient(options){return {requestAccessToken(request){test.prompts.push(request.prompt);options.callback({access_token:test.invalidToken?{}:'jjo-browser-fixture-token',token_type:'Bearer',expires_in:test.lifetime,scope:test.missingScope?'https://www.googleapis.com/auth/analytics.readonly':options.scope});}};},
      revoke(token,callback){if(token==='jjo-browser-fixture-token')test.revoked++;callback();}
    }}};
    window.fetch=(url,options)=>{
      if(!/analyticsdata.googleapis.com|www.googleapis.com\\/webmasters/.test(String(url)))return test.originalFetch(url,options);
      test.requests.push({url:String(url),authorization:options.headers.Authorization,signal:options.signal});
      const body=JSON.parse(options.body);
      if(test.unauthorized&&String(url).includes('analyticsdata')&&!body.dimensions)return Promise.resolve(new Response(JSON.stringify({error:{details:[{reason:'CREDENTIALS_MISSING'}]}}),{status:401,headers:{'Content-Type':'application/json'}}));
      const value=String(url).includes('analyticsdata')?(body.dimensions?{rows:[{dimensionValues:[{value:'/posts/rl-robot-learning-ch01-introduction'}],metricValues:[{value:'12'}]}]}:{rows:[{metricValues:[{value:'7'},{value:'9'},{value:'20'}]}]}):
        {rows:[{keys:[body.dimensions[0]==='query'?'<img src=x onerror="window.__analyticsXss=true">':'https://jjo-0.github.io/posts/rl-robot-learning-ch01-introduction/'],clicks:2,impressions:20,ctr:0.1}]};
      const response=()=>new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json'}});
      if(test.defer)return new Promise(resolve=>test.pending.push(()=>resolve(response())));
      return Promise.resolve(response());
    };
    document.dispatchEvent(new Event('astro:page-load'));
  })()`);
  await waitExpression(cdp, sessionId, `!document.querySelector('[data-admin-login]').disabled`, 'Fixture Google SDK initialized');
  const login = () => evaluate(cdp, sessionId, `document.querySelector('[data-admin-login]').click()`);
  const empty = `(() => {const r=document.querySelector('[data-analytics-dashboard]');return r.querySelector('[data-admin-results]').hidden && [...r.querySelectorAll('[data-admin-metric]')].every(m=>m.textContent==='—') && ['[data-admin-top-posts]','[data-admin-categories]','[data-admin-topics]','[data-admin-queries]','[data-admin-search-pages]','[data-admin-ga-status]','[data-admin-gsc-status]'].every(s=>!r.querySelector(s).textContent);})()`;
  await login();
  await waitExpression(cdp, sessionId, `document.querySelector('[data-admin-queries]').textContent.includes('<img')`, 'Fixture reports rendered');
  assert(await evaluate(cdp, sessionId, `!window.__analyticsXss && !document.querySelector('[data-admin-queries] img')`), 'Untrusted query rendered as text');
  assert.deepEqual(await evaluate(cdp, sessionId, `[...document.querySelectorAll('[data-admin-metric]')].map(m=>m.textContent)`), ['7','9','20'], 'Site-wide users, sessions and views keep their distinct meanings');
  assert(await evaluate(cdp, sessionId, `window.__analyticsTest.requests.every(r=>r.authorization==='Bearer jjo-browser-fixture-token')`));
  assert(await evaluate(cdp, sessionId, `![...Object.values(localStorage),...Object.values(sessionStorage)].some(value=>value.includes('jjo-browser-fixture-token'))`), 'Access token never persisted');
  await evaluate(cdp, sessionId, `document.querySelector('[data-admin-logout]').click()`);
  assert(await evaluate(cdp, sessionId, empty), 'Logout erases private report DOM');
  assert.equal(await evaluate(cdp, sessionId, `window.__analyticsTest.revoked`), 1);

  await evaluate(cdp, sessionId, `window.__analyticsTest.unauthorized=true`);
  await login();
  await waitExpression(cdp, sessionId, `document.querySelector('[data-admin-status]').textContent.includes('CREDENTIALS_MISSING')`, 'Unauthorized Google session prompts reconnect');
  assert(await evaluate(cdp, sessionId, empty), 'A summary-only 401 discards the token and all private DOM, including successful peer requests');
  assert(await evaluate(cdp, sessionId, `!document.querySelector('[data-admin-login]').hidden`), '401 restores login control');
  await evaluate(cdp, sessionId, `window.__analyticsTest.unauthorized=false`);

  await evaluate(cdp, sessionId, `window.__analyticsTest.invalidToken=true;window.__analyticsTest.requests=[]`);
  await login();
  assert(await evaluate(cdp, sessionId, `window.__analyticsTest.requests.length===0`), 'Malformed grants cannot reach a private API');
  assert(await evaluate(cdp, sessionId, empty));
  await evaluate(cdp, sessionId, `window.__analyticsTest.invalidToken=false;window.__analyticsTest.missingScope=true`);
  await login();
  assert(await evaluate(cdp, sessionId, `window.__analyticsTest.requests.length===0`), 'Partial consent cannot be mistaken for a complete connection');
  assert(await evaluate(cdp, sessionId, `document.querySelector('[data-admin-status]').textContent.includes('두')||document.querySelector('[data-admin-status]').textContent.includes('모두')`));
  await evaluate(cdp, sessionId, `window.__analyticsTest.missingScope=false`);
  await login();
  await waitExpression(cdp, sessionId, `document.querySelector('[data-admin-ga-status]').textContent.includes('연결 확인')&&document.querySelector('[data-admin-gsc-status]').textContent.includes('연결 확인')`, 'Both real-source status controls reflect successful fixture responses');
  assert(await evaluate(cdp, sessionId, `window.__analyticsTest.prompts.slice(-3).every(prompt=>prompt==='consent select_account')`), 'Rejected grants require an explicit account and consent refresh');
  await evaluate(cdp, sessionId, `document.querySelector('[data-admin-logout]').click()`);

  await evaluate(cdp, sessionId, `window.__analyticsTest.defer=true`);
  await login();
  await waitExpression(cdp, sessionId, `window.__analyticsTest.pending.length===4`, 'Deferred report requests');
  await evaluate(cdp, sessionId, `document.querySelector('[data-admin-logout]').click();window.__analyticsTest.pending.splice(0).forEach(resolve=>resolve())`);
  await evaluate(cdp, sessionId, `new Promise(resolve=>setTimeout(resolve,100))`);
  assert(await evaluate(cdp, sessionId, empty), 'Late responses cannot repopulate logout');
  assert(await evaluate(cdp, sessionId, `window.__analyticsTest.requests.slice(-4).every(r=>r.signal.aborted)`), 'In-flight reports aborted');

  await evaluate(cdp, sessionId, `window.__analyticsTest.defer=false;window.__analyticsTest.lifetime=0.5`);
  await login();
  await waitExpression(cdp, sessionId, `document.querySelector('[data-admin-queries]').textContent.includes('<img')`, 'Short-lived fixture report rendered');
  await waitExpression(cdp, sessionId, empty, 'Expiry erases token session and private report DOM');
  assert(await evaluate(cdp, sessionId, `document.querySelector('[data-admin-status]').textContent.includes('만료')`));

  await evaluate(cdp, sessionId, `window.__analyticsTest.lifetime=3600`);
  await login();
  await waitExpression(cdp, sessionId, `document.querySelector('[data-admin-queries]').textContent.includes('<img')`, 'Last fixture report rendered');
  await evaluate(cdp, sessionId, `document.dispatchEvent(new Event('astro:before-swap'))`);
  assert(await evaluate(cdp, sessionId, empty), 'SPA page departure erases private report DOM');
  await evaluate(cdp, sessionId, `window.fetch=window.__analyticsTest.originalFetch;delete window.__analyticsTest;delete window.google;`);
  console.log('analytics-browser: PASS setup at 320/390/1440px; fixture login, text escaping, logout, aborted late response, expiry, SPA cleanup; real Google connection not tested');
}
