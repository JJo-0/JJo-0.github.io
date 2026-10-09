import assert from 'node:assert/strict';
import fs from 'node:fs';
const { chromium } = await import(process.env.JJO_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.JJO_ISAIAH_BASE || 'http://127.0.0.1:4321';
const out = process.env.JJO_ISAIAH_OUTPUT || '/tmp/isaiah-browser';
fs.mkdirSync(out, {recursive:true});
(async () => {
 const browser = await chromium.launch({executablePath:process.env.JJO_CHROMIUM || '/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const results=[];
 for(const width of [390,1440]) for(const i of [1,2,3]) {
  const page=await browser.newPage({viewport:{width,height:1000},locale:'ko-KR'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}/posts/isaiah-43-18-21-${i}/`,{waitUntil:'networkidle'});
  await page.locator('[data-isaiah-frame]').scrollIntoViewIfNeeded();
  const frame=page.frames().find(f=>f.url().includes('/assets/interactive/isaiah'));
  await frame.waitForFunction(()=>window.Chart);
  const tabs=await frame.locator('button[onclick*="switchTab"]').evaluateAll(items=>[...new Set(items.map(b=>b.getAttribute('onclick').match(/switchTab\('([^']+)'\)/)[1]))]);
  for(const tab of tabs) {
    let button=frame.locator(`button[onclick="switchTab('${tab}')"]`);
    if(!await button.isVisible() && i===2) await frame.locator('button[onclick="toggleMobileMenu()"]').click();
    if(await button.isVisible()) await button.click();
    else await frame.locator(`button[onclick="switchTab('${tab}'); toggleMobileMenu()"]`).click();
  }
  const charts=await frame.evaluate(()=>Object.values(window.Chart.instances).map(c=>({id:c.canvas.id,data:c.data.datasets.map(d=>d.data),canvas:!!c.ctx})));
  assert.equal(charts.length,[1,3,2][i-1]);assert(charts.every(c=>c.canvas));
  if(i===1) {
    await frame.locator('#tab-lexicon').click();
    const search=frame.locator('#lexicon-search');
    const before=await frame.locator('#lexicon-grid > div').count();
    assert(before>0);
    await search.fill('zzzz-no-term');
    assert.equal(await frame.locator('#lexicon-grid > div').count(),0);
    await search.fill('');
    assert.equal(await frame.locator('#lexicon-grid > div').count(),before);
  }
  if(i===2) {
    await frame.evaluate(()=>window.switchTab('boundary'));
    await frame.locator('#btn-m3').click();
    await frame.evaluate(()=>window.switchTab('closereading'));
    await frame.locator('button[onclick="toggleAccordion(\'cr-18\')"]').click();
  }
  if(i===3) {
    await frame.locator('#nav-tab1').click();
    const card=frame.locator('[onclick="toggleModal(\'m1\')"]');await card.focus();await card.press('Enter');
    await frame.locator('button[onclick="closeModal()"]').last().click();
    await frame.locator('#globalSearch').fill('기억');
    await frame.locator('#globalSearch').press('Enter');
    assert((await frame.locator('#nav-tab2').getAttribute('class')).includes('active'));
    await frame.locator('button[onclick="resetFilters()"]').click();
    assert.equal(await frame.locator('#globalSearch').inputValue(),'');
  }
  const tables=await page.locator('[data-isaiah-research-body] table').count();assert.equal(tables,[7,4,6][i-1]);
  assert.equal(await page.locator('a[href*="gemini.google.com/app/"]').count(),0);
  const cite=page.locator('[data-isaiah-research-body] sup a').first();const href=await cite.getAttribute('href');await cite.click();assert.equal(await page.locator(href).count(),1);
  await page.locator('[data-isaiah-frame]').scrollIntoViewIfNeeded();
  for(const dark of [false,true]) {
    await page.evaluate(dark=>document.documentElement.classList.toggle('dark',dark),dark);
    await page.waitForTimeout(150);
    const appearance=await frame.evaluate(()=>({background:getComputedStyle(document.body).backgroundColor,overflow:document.documentElement.scrollWidth>innerWidth+1}));
    assert.equal(appearance.background,dark?'rgb(28, 33, 29)':'rgb(243, 239, 228)');assert(!appearance.overflow);
    await page.screenshot({path:`${out}/${i}-${width}-${dark?'dark':'light'}.png`});
    results.push({i,width,dark,tables,charts,appearance,errors});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 await browser.close();fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.log('PASS 12 viewport/theme cases, actual tab clicks, 6 charts, search/reset, modal keyboard, citations, privacy and overflow.');
})().catch(e=>{console.error(e);process.exit(1)});
