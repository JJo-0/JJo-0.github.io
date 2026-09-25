import assert from 'node:assert/strict';
import { evaluate, waitExpression } from './browser-smoke-harness.mjs';

// Adds consumer-guide coverage without relaxing the existing research-news checks.
export async function checkPowerBankPage({ cdp, sessionId, width, lang, enter, screen }) {
  await waitExpression(cdp, sessionId, `document.querySelector('[data-pb-products]')?.dataset.ready === 'true' && document.querySelector('[data-pb-calc]')?.dataset.ready === 'true'`, 'power-bank tools initialized');
  const structure = await evaluate(cdp, sessionId, `(() => {
    const hero = document.querySelector('.pb-hero');
    const article = hero?.closest('article');
    const products = document.querySelector('[data-pb-products]');
    const visuals = [...document.querySelectorAll('[data-pb-visual]')];
    const searches = [...document.querySelectorAll('[data-pb-search]')];
    return {
      visuals: visuals.map(v => v.dataset.pbVisual),
      photos: document.querySelectorAll('.pb-photo img').length,
      products: document.querySelectorAll('[data-pb-product]').length,
      searches: searches.length,
      productsLast: Boolean(article && products) && [...article.querySelectorAll('h2,[data-pb-visual]')].every(el => !(products.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)),
      searchOnly: searches.every(a => { const u = new URL(a.href); const card = a.closest('[data-pb-product]'); const model = card.querySelector('h3').textContent.trim(); const key = u.hostname === 'www.coupang.com' ? 'q' : 'query'; return u.protocol === 'https:' && ((u.hostname === 'www.coupang.com' && u.pathname === '/np/search') || (u.hostname === 'search.danawa.com' && u.pathname === '/dsearch.php')) && [...u.searchParams.keys()].length === 1 && u.searchParams.get(key)?.includes(model); }),
      svgTextFits: [...document.querySelectorAll('[data-pb-visual] svg text')].every(t => { const b = t.getBBox(); return b.x >= -1 && b.x + b.width <= 561; }),
      overflow: document.documentElement.scrollWidth > innerWidth + 2,
      hero: hero?.innerText.includes('BUY LESS, CHOOSE BETTER'),
      correctedEnergy: products?.innerText.includes('99.75 Wh')
    };
  })()`);
  assert.deepEqual(structure.visuals, ['capacity','energy','boost','pd','cccv','heat','bms','wireless','mass','test']);
  assert.equal(structure.photos, 3); assert.equal(structure.products, 9); assert.equal(structure.searches, 18);
  assert(structure.productsLast && structure.searchOnly && structure.svgTextFits && !structure.overflow && structure.hero && structure.correctedEnergy, JSON.stringify(structure));
  await evaluate(cdp, sessionId, `document.querySelector('.pb-hero').scrollIntoView({block:'start',behavior:'instant'})`);
  await screen(`power-bank-${lang}-${width}-hero`);
  await evaluate(cdp, sessionId, `document.querySelector('[data-pb-visual="boost"]').scrollIntoView({block:'start',behavior:'instant'})`);
  await screen(`power-bank-${lang}-${width}-mechanism`);
  await enter('[data-filter="laptop"]');
  assert.equal(await evaluate(cdp, sessionId, `document.querySelectorAll('[data-pb-product]:not([hidden])').length`), 5);
  await enter('[data-filter="all"]');
  assert.equal(await evaluate(cdp, sessionId, `document.querySelectorAll('[data-pb-product]:not([hidden])').length`), 9);
  await enter('[data-copy]');
  await waitExpression(cdp, sessionId, `Boolean(document.querySelector('[data-pb-copy-status]')?.textContent.trim())`, 'copy success or accessible manual-copy fallback');
  await screen(`power-bank-${lang}-${width}-products`);
  const calculator = await evaluate(cdp, sessionId, `(() => {
    const input = document.querySelector('[data-pb-calc] input[name="mah"]');
    const output = document.querySelector('[data-pb-calc] output');
    const initial = output.textContent;
    input.value = '-1'; input.dispatchEvent(new Event('input', {bubbles:true}));
    const invalid = output.textContent;
    input.value = '20000'; input.dispatchEvent(new Event('input', {bubbles:true}));
    return {initial, invalid, restored:output.textContent};
  })()`);
  assert(calculator.initial.includes('63.94') && !calculator.invalid.includes('Wh nominal') && calculator.restored.includes('63.94'), JSON.stringify(calculator));
  return { lang, width, ...structure, filters:true, copyFeedback:true, calculator:true };
}
