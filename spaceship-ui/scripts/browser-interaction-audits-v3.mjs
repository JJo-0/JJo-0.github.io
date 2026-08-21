import assert from 'node:assert/strict';
import {
  BASE,
  evaluate,
  navigate,
  viewport,
  waitExpression,
} from './browser-smoke-harness.mjs';

const CORE_ROUTES = ['/', '/research', '/about', '/posts'];

const NORMALIZE_SOURCE = `(value) => (value || '').replace(/\\s+/g, ' ').trim()`;
const VISIBLE_SOURCE = `(node) => {
  if (!node || node.classList.contains('sr-only')) return false;
  const style = getComputedStyle(node);
  const rect = node.getBoundingClientRect();
  return style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    Number(style.opacity) > 0 &&
    rect.width > 1 && rect.height > 1;
}`;
const REGION_SOURCE = `(anchor) => {
  if (anchor.closest('[aria-label="Breadcrumb"]')) return 'breadcrumb';
  const nav = anchor.closest('nav');
  if (nav) return 'nav:' + (nav.getAttribute('aria-label') || 'unlabelled');
  if (anchor.closest('header')) return 'header';
  if (anchor.closest('footer')) return 'footer';
  if (anchor.closest('aside')) return 'aside';
  if (anchor.closest('main')) return 'main';
  return 'other';
}`;

const INVENTORY_EXPRESSION = `(() => {
  const normalize = ${NORMALIZE_SOURCE};
  const visible = ${VISIBLE_SOURCE};
  const regionOf = ${REGION_SOURCE};
  const anchors = [...document.querySelectorAll('a[href]')]
    .filter((node) => !(node instanceof SVGAElement))
    .filter(visible);

  return anchors.map((anchor) => {
    const href = anchor.getAttribute('href');
    const text = normalize(anchor.textContent);
    const aria = anchor.getAttribute('aria-label') || '';
    const region = regionOf(anchor);
    const identityMatches = anchors.filter((candidate) =>
      candidate.getAttribute('href') === href &&
      normalize(candidate.textContent) === text &&
      (candidate.getAttribute('aria-label') || '') === aria &&
      regionOf(candidate) === region
    );

    return {
      href,
      text,
      aria,
      region,
      ordinal: identityMatches.indexOf(anchor),
      absolute: new URL(href, location.href).href,
      target: anchor.getAttribute('target') || '',
      rel: anchor.getAttribute('rel') || '',
      download: anchor.hasAttribute('download'),
      homeSemantic: anchor.hasAttribute('data-site-brand') ||
        anchor.closest('[aria-label="Breadcrumb"]') !== null ||
        /\\bhome\\b|park\\s*jiho/i.test(text + ' ' + aria),
    };
  });
})()`;

function anchorExpression(anchor, body) {
  return `(() => {
    const normalize = ${NORMALIZE_SOURCE};
    const visible = ${VISIBLE_SOURCE};
    const regionOf = ${REGION_SOURCE};
    const candidates = [...document.querySelectorAll('a[href]')]
      .filter((node) => !(node instanceof SVGAElement))
      .filter(visible)
      .filter((candidate) =>
        candidate.getAttribute('href') === ${JSON.stringify(anchor.href)} &&
        normalize(candidate.textContent) === ${JSON.stringify(anchor.text)} &&
        (candidate.getAttribute('aria-label') || '') === ${JSON.stringify(anchor.aria)} &&
        regionOf(candidate) === ${JSON.stringify(anchor.region)}
      );
    const target = candidates[${anchor.ordinal}];
    ${body}
  })()`;
}

async function trustedClickPoint(cdp, sessionId, expression, label) {
  const point = await waitExpression(
    cdp,
    sessionId,
    expression,
    `${label} clickable point`,
  );

  assert.ok(Number.isFinite(point?.x) && Number.isFinite(point?.y), `${label}: invalid click point`);
  assert.ok(point.x >= 0 && point.y >= 0, `${label}: negative click point`);

  await cdp.send(
    'Input.dispatchMouseEvent',
    { type: 'mouseMoved', x: point.x, y: point.y, button: 'none' },
    sessionId,
  );
  await cdp.send(
    'Input.dispatchMouseEvent',
    { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 },
    sessionId,
  );
  await cdp.send(
    'Input.dispatchMouseEvent',
    { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 },
    sessionId,
  );
}

function centerExpression(selectorExpression) {
  return `(() => {
    const target = ${selectorExpression};
    if (!target) return null;
    target.scrollIntoView({ block: 'center', inline: 'nearest' });
    const rect = target.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) return null;
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`;
}

async function clickRouteLinks(cdp, sessionId, route) {
  await navigate(cdp, sessionId, route);
  const anchors = await evaluate(cdp, sessionId, INVENTORY_EXPRESSION);
  const origin = new URL(BASE).origin;
  let clicked = 0;

  for (const [index, anchor] of anchors.entries()) {
    const label = `${anchor.region}:${anchor.text || anchor.aria || anchor.href || `link-${index}`}`;
    assert.ok(anchor.href, `${route} ${label}: empty href`);
    assert.equal(/^javascript:/i.test(anchor.href), false, `${route} ${label}: javascript URL`);

    const expected = new URL(anchor.absolute);
    const http = expected.protocol === 'http:' || expected.protocol === 'https:';
    const internal =
      http &&
      expected.origin === origin &&
      !anchor.download &&
      (!anchor.target || anchor.target === '_self');

    if (!internal) {
      if (http && expected.origin !== origin) {
        assert.equal(anchor.target, '_blank', `${route} ${label}: external target`);
        assert.match(anchor.rel, /noopener|noreferrer/, `${route} ${label}: external rel`);
      } else if (http && anchor.target === '_blank') {
        assert.match(anchor.rel, /noopener|noreferrer/, `${route} ${label}: target blank rel`);
      }
      continue;
    }

    if (expected.pathname === '/') {
      assert.equal(anchor.homeSemantic, true, `${route}: unexpected Home target from “${label}”`);
    }

    await navigate(cdp, sessionId, route);
    await trustedClickPoint(
      cdp,
      sessionId,
      anchorExpression(anchor, `
        if (!target) return null;
        target.scrollIntoView({ block: 'center', inline: 'nearest' });
        const rect = target.getBoundingClientRect();
        if (rect.width <= 1 || rect.height <= 1) return null;
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      `),
      `${route} ${label}`,
    );

    await waitExpression(
      cdp,
      sessionId,
      `location.pathname === ${JSON.stringify(expected.pathname)} &&
       location.search === ${JSON.stringify(expected.search)} &&
       location.hash === ${JSON.stringify(expected.hash)}`,
      `${route} trusted click ${label}`,
    );

    const actual = await evaluate(cdp, sessionId, `location.pathname + location.search + location.hash`);
    assert.equal(actual, `${expected.pathname}${expected.search}${expected.hash}`);
    if (expected.pathname !== '/') {
      assert.notEqual(actual, '/', `${route} ${label}: click fell back to Home`);
    }
    if (expected.hash) {
      assert.equal(
        await evaluate(
          cdp,
          sessionId,
          `Boolean(document.getElementById(decodeURIComponent(location.hash.slice(1))))`,
        ),
        true,
        `${route} ${label}: hash target missing`,
      );
    }
    clicked += 1;
  }

  console.log(`browser-smoke: PASS ${route} trusted visible-link routing (${clicked} internal clicks)`);
  return clicked;
}

async function auditSearch(cdp, sessionId) {
  await navigate(cdp, sessionId, '/');
  await trustedClickPoint(
    cdp,
    sessionId,
    centerExpression(`document.querySelector('button[aria-label="Search"]')`),
    'Search button',
  );
  await waitExpression(
    cdp,
    sessionId,
    `Boolean(document.querySelector('input[placeholder^="Search post"]'))`,
    'search dialog open',
  );
  assert.equal(await evaluate(cdp, sessionId, `location.pathname`), '/');

  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' }, sessionId);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' }, sessionId);
  await waitExpression(
    cdp,
    sessionId,
    `!document.querySelector('input[placeholder^="Search post"]')`,
    'search dialog Escape close',
  );

  await trustedClickPoint(
    cdp,
    sessionId,
    centerExpression(`document.querySelector('button[aria-label="Search"]')`),
    'Search button reopen',
  );
  const sample = await evaluate(
    cdp,
    sessionId,
    `fetch('/api/search.json').then((response) => response.json()).then((items) => ({
      id: items[0].id,
      title: items[0].data.title,
    }))`,
  );
  assert.ok(sample?.id && sample?.title, 'search API returned no auditable item');

  await waitExpression(
    cdp,
    sessionId,
    `Boolean(document.querySelector('input[placeholder^="Search post"]'))`,
    'search dialog reopen',
  );
  await evaluate(cdp, sessionId, `(() => {
    const input = document.querySelector('input[placeholder^="Search post"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, ${JSON.stringify(sample.title)});
    input.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      inputType: 'insertText',
      data: ${JSON.stringify(sample.title)},
    }));
  })()`);

  const href = `/posts/${sample.id}`;
  await trustedClickPoint(
    cdp,
    sessionId,
    centerExpression(`document.querySelector(${JSON.stringify(`a[href="${href}"]`)})`),
    'Search result',
  );
  await waitExpression(
    cdp,
    sessionId,
    `location.pathname === ${JSON.stringify(href)}`,
    'search result navigation',
  );
  assert.notEqual(await evaluate(cdp, sessionId, `location.pathname`), '/');
  console.log('browser-smoke: PASS Search trusted click/Escape/result routing');
}

async function auditTheme(cdp, sessionId) {
  await navigate(cdp, sessionId, '/about');
  for (const name of ['Dark', 'Light', 'System']) {
    await trustedClickPoint(
      cdp,
      sessionId,
      centerExpression(`document.querySelector('button[aria-label="Theme Menu"]')`),
      `Theme menu for ${name}`,
    );
    await trustedClickPoint(
      cdp,
      sessionId,
      centerExpression(
        `[...document.querySelectorAll('button')]
          .find((button) => button.textContent.trim() === ${JSON.stringify(name)})`,
      ),
      `Theme ${name}`,
    );
    await waitExpression(
      cdp,
      sessionId,
      `localStorage.getItem('theme') === ${JSON.stringify(name.toLowerCase())}`,
      `theme ${name}`,
    );
    assert.equal(await evaluate(cdp, sessionId, `location.pathname`), '/about');
    assert.equal(
      await evaluate(cdp, sessionId, `document.documentElement.classList.contains('dark')`),
      name === 'Dark',
    );
  }
  console.log('browser-smoke: PASS Theme trusted clicks preserve About route');
}

async function auditAboutFont(cdp, sessionId) {
  await navigate(cdp, sessionId, '/about');
  const metrics = await waitExpression(
    cdp,
    sessionId,
    `document.fonts.ready.then(() => {
      const title = document.querySelector('[data-about-title]');
      const content = document.querySelector('[data-about-content]');
      const paragraph = content?.querySelector('p');
      const heading = content?.querySelector('h2');
      if (!title || !content || !paragraph || !heading) return null;
      const nodes = [title, content, paragraph, heading];
      return {
        families: nodes.map((node) => getComputedStyle(node).fontFamily),
        weight: Number(getComputedStyle(title).fontWeight),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      };
    })`,
    'About typography metrics',
  );

  assert.equal(
    new Set(metrics.families).size,
    1,
    `mixed About fonts: ${metrics.families.join(' | ')}`,
  );
  assert.equal(metrics.families[0].toLowerCase().includes('outfit'), false);
  assert.match(metrics.families[0], /Noto Sans KR|Apple SD Gothic Neo|Malgun Gothic/i);
  assert.ok(metrics.weight >= 700);
  assert.equal(metrics.overflow, false);
  console.log(`browser-smoke: PASS About unified Korean typography (${metrics.families[0]})`);
}

export async function auditInteractions(cdp, sessionId) {
  await viewport(cdp, sessionId, { width: 1440, height: 900 });
  let clicks = 0;
  for (const route of CORE_ROUTES) clicks += await clickRouteLinks(cdp, sessionId, route);
  assert.ok(clicks >= 30, `too few internal controls audited: ${clicks}`);
  await auditSearch(cdp, sessionId);
  await auditTheme(cdp, sessionId);
  await auditAboutFont(cdp, sessionId);
  return clicks;
}
