import assert from 'node:assert/strict';
import {
  BASE,
  evaluate,
  navigate,
  viewport,
  waitExpression,
} from './browser-smoke-harness.mjs';

const ROUTES = ['/', '/research', '/about', '/posts'];
const NORMALIZE = `(value) => (value || '').replace(/\\s+/g, ' ').trim()`;
const REGION = `(anchor) => {
  if (anchor.closest('[aria-label="Breadcrumb"]')) return 'breadcrumb';
  const nav = anchor.closest('nav');
  if (nav) return 'nav:' + (nav.getAttribute('aria-label') || 'unlabelled');
  if (anchor.closest('header')) return 'header';
  if (anchor.closest('footer')) return 'footer';
  if (anchor.closest('aside')) return 'aside';
  if (anchor.closest('main')) return 'main';
  return 'other';
}`;
const VISIBLE = `(node) => {
  if (!node || node.classList.contains('sr-only')) return false;
  const style = getComputedStyle(node);
  const rect = node.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' &&
    Number(style.opacity) > 0 && rect.width > 1 && rect.height > 1;
}`;

const INVENTORY = `(() => {
  const normalize = ${NORMALIZE};
  const regionOf = ${REGION};
  const visible = ${VISIBLE};
  const all = [...document.querySelectorAll('a[href]')]
    .filter((node) => !(node instanceof SVGAElement));
  const shown = all.filter(visible);

  return shown.map((anchor) => {
    const href = anchor.getAttribute('href');
    const text = normalize(anchor.textContent);
    const aria = anchor.getAttribute('aria-label') || '';
    const region = regionOf(anchor);
    const matches = all.filter((candidate) =>
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
      ordinal: matches.indexOf(anchor),
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

function identitySource(link) {
  return `
    const normalize = ${NORMALIZE};
    const regionOf = ${REGION};
    const matches = [...document.querySelectorAll('a[href]')]
      .filter((node) => !(node instanceof SVGAElement))
      .filter((candidate) =>
        candidate.getAttribute('href') === ${JSON.stringify(link.href)} &&
        normalize(candidate.textContent) === ${JSON.stringify(link.text)} &&
        (candidate.getAttribute('aria-label') || '') === ${JSON.stringify(link.aria)} &&
        regionOf(candidate) === ${JSON.stringify(link.region)}
      );
    const target = matches[${link.ordinal}];
  `;
}

function stablePointExpression(link) {
  return `(async () => {
    ${identitySource(link)}
    if (!target) return null;

    const root = document.documentElement;
    const body = document.body;
    const previousRootBehavior = root.style.scrollBehavior;
    const previousBodyBehavior = body.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';

    const initial = target.getBoundingClientRect();
    const absoluteTop = scrollY + initial.top;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const desired = Math.min(maxScroll, Math.max(0, absoluteTop - innerHeight / 2 + initial.height / 2));
    scrollTo({ top: desired, left: 0, behavior: 'instant' });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    root.style.scrollBehavior = previousRootBehavior;
    body.style.scrollBehavior = previousBodyBehavior;

    const rect = target.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) return null;
    const insetX = Math.min(24, Math.max(4, rect.width * 0.2));
    const insetY = Math.min(24, Math.max(4, rect.height * 0.2));
    const candidates = [
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      { x: rect.left + insetX, y: rect.top + insetY },
      { x: rect.right - insetX, y: rect.top + insetY },
      { x: rect.left + insetX, y: rect.bottom - insetY },
      { x: rect.right - insetX, y: rect.bottom - insetY },
    ].filter((point) =>
      point.x >= 0 && point.x < innerWidth && point.y >= 0 && point.y < innerHeight
    );

    for (const point of candidates) {
      const hit = document.elementFromPoint(point.x, point.y);
      if (hit && (hit === target || target.contains(hit))) {
        return {
          ...point,
          hitTag: hit.tagName,
          hitText: (hit.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 80),
          targetRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
        };
      }
    }

    return {
      blocked: true,
      targetRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      hits: candidates.map((point) => {
        const hit = document.elementFromPoint(point.x, point.y);
        return {
          ...point,
          tag: hit?.tagName || null,
          text: (hit?.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 80),
        };
      }),
    };
  })()`;
}

async function trustedClick(cdp, sessionId, pointExpression, label) {
  const point = await waitExpression(cdp, sessionId, pointExpression, `${label} hit-test`, 20_000);
  assert.equal(point?.blocked, undefined, `${label}: click target blocked: ${JSON.stringify(point)}`);
  assert.ok(Number.isFinite(point?.x) && Number.isFinite(point?.y), `${label}: invalid point`);

  await cdp.send(
    'Input.dispatchMouseEvent',
    { type: 'mouseMoved', x: point.x, y: point.y, button: 'none', pointerType: 'mouse' },
    sessionId,
  );
  await cdp.send(
    'Input.dispatchMouseEvent',
    {
      type: 'mousePressed',
      x: point.x,
      y: point.y,
      button: 'left',
      buttons: 1,
      clickCount: 1,
      pointerType: 'mouse',
    },
    sessionId,
  );
  await cdp.send(
    'Input.dispatchMouseEvent',
    {
      type: 'mouseReleased',
      x: point.x,
      y: point.y,
      button: 'left',
      buttons: 0,
      clickCount: 1,
      pointerType: 'mouse',
    },
    sessionId,
  );
  return point;
}

async function expectUrl(cdp, sessionId, expected, label) {
  try {
    await waitExpression(
      cdp,
      sessionId,
      `location.pathname === ${JSON.stringify(expected.pathname)} &&
       location.search === ${JSON.stringify(expected.search)} &&
       location.hash === ${JSON.stringify(expected.hash)}`,
      label,
      8_000,
    );
  } catch (error) {
    const diagnostic = await evaluate(cdp, sessionId, `({
      actual: location.pathname + location.search + location.hash,
      href: location.href,
      activeText: (document.activeElement?.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 120),
      activeHref: document.activeElement?.getAttribute?.('href') || null,
    })`);
    throw new Error(`${label}: ${error.message}; diagnostic=${JSON.stringify(diagnostic)}`);
  }
}

async function probeInternalTargets(entries, route) {
  const targets = [...new Set(entries.map(({ expected }) => {
    const target = new URL(expected.href);
    target.hash = '';
    return target.href;
  }))];

  for (let offset = 0; offset < targets.length; offset += 8) {
    const batch = targets.slice(offset, offset + 8);
    const results = await Promise.all(
      batch.map(async (url) => {
        try {
          const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
          return { url, status: response.status, ok: response.ok };
        } catch (error) {
          return { url, status: 0, ok: false, error: error instanceof Error ? error.message : String(error) };
        }
      }),
    );
    for (const result of results) {
      assert.equal(
        result.ok,
        true,
        `${route}: unreachable internal target ${result.url}; status=${result.status}; error=${result.error || 'none'}`,
      );
    }
  }
  return targets.length;
}

async function validateClickedDestination(cdp, sessionId, route, entry) {
  await navigate(cdp, sessionId, route);
  await trustedClick(cdp, sessionId, stablePointExpression(entry.link), entry.label);
  await expectUrl(cdp, sessionId, entry.expected, `${entry.label} destination`);

  const actual = await evaluate(cdp, sessionId, `location.pathname + location.search + location.hash`);
  assert.equal(actual, `${entry.expected.pathname}${entry.expected.search}${entry.expected.hash}`);
  if (entry.expected.pathname !== '/') assert.notEqual(actual, '/', `${entry.label}: fell back to Home`);
  if (entry.expected.hash) {
    assert.equal(
      await evaluate(
        cdp,
        sessionId,
        `Boolean(document.getElementById(decodeURIComponent(location.hash.slice(1))))`,
      ),
      true,
      `${entry.label}: hash target missing`,
    );
  }
}

async function auditRoute(cdp, sessionId, route) {
  await navigate(cdp, sessionId, route);
  const links = await evaluate(cdp, sessionId, INVENTORY);
  const origin = new URL(BASE).origin;
  const internalEntries = [];
  let clicked = 0;

  for (const [index, link] of links.entries()) {
    const label = `${route} ${link.region}:${link.text || link.aria || link.href || index}`;
    assert.ok(link.href, `${label}: empty href`);
    assert.equal(/^javascript:/i.test(link.href), false, `${label}: javascript URL`);

    const expected = new URL(link.absolute);
    const http = expected.protocol === 'http:' || expected.protocol === 'https:';
    const internal =
      http && expected.origin === origin && !link.download &&
      (!link.target || link.target === '_self');

    if (!internal) {
      if (http && expected.origin !== origin) {
        assert.equal(link.target, '_blank', `${label}: external target`);
        assert.match(link.rel, /noopener|noreferrer/, `${label}: external rel`);
      } else if (http && link.target === '_blank') {
        assert.match(link.rel, /noopener|noreferrer/, `${label}: target blank rel`);
      }
      continue;
    }

    if (expected.pathname === '/') {
      assert.equal(link.homeSemantic, true, `${label}: unexpected Home target`);
    }

    const entry = { link, label, expected };
    internalEntries.push(entry);

    // Core routes stay exhaustively activation-tested. Writing is an archive:
    // every destination remains exhaustively HEAD-probed, while representative
    // route families are trusted-clicked so the matrix does not grow O(posts).
    if (route === '/posts') continue;

    await validateClickedDestination(cdp, sessionId, route, entry);
    clicked += 1;
  }

  if (route === '/posts') {
    const probed = await probeInternalTargets(internalEntries, route);
    const representatives = [
      internalEntries.find(({ expected }) => expected.pathname === '/'),
      internalEntries.find(({ expected }) => expected.pathname === '/research'),
      internalEntries.find(({ expected }) => expected.pathname === '/posts' && Boolean(expected.hash)),
      internalEntries.find(({ expected }) => expected.pathname.startsWith('/posts/tag/')),
      internalEntries.find(
        ({ expected }) => expected.pathname.startsWith('/posts/') && !expected.pathname.startsWith('/posts/tag/'),
      ),
    ].filter(Boolean);

    const unique = [];
    const seen = new Set();
    for (const entry of representatives) {
      const key = `${entry.expected.pathname}${entry.expected.search}${entry.expected.hash}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(entry);
    }
    assert.ok(unique.length >= 4, `/posts: too few representative trusted targets: ${unique.length}`);

    for (const entry of unique) {
      await validateClickedDestination(cdp, sessionId, route, entry);
      clicked += 1;
    }

    console.log(
      `browser-smoke: PASS ${route} link integrity (${probed} HEAD targets; ${clicked} representative trusted clicks)`,
    );
    return clicked;
  }

  console.log(`browser-smoke: PASS ${route} stable trusted-link routing (${clicked} internal clicks)`);
  return clicked;
}

function selectorPoint(selectorExpression) {
  return `(async () => {
    const target = ${selectorExpression};
    if (!target) return null;
    const rect = target.getBoundingClientRect();
    const point = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const hit = document.elementFromPoint(point.x, point.y);
    if (!hit || (hit !== target && !target.contains(hit))) {
      return { blocked: true, tag: hit?.tagName || null };
    }
    return point;
  })()`;
}

async function auditSearch(cdp, sessionId) {
  await navigate(cdp, sessionId, '/');
  await trustedClick(
    cdp,
    sessionId,
    selectorPoint(`document.querySelector('button[aria-label="Search"]')`),
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

  await trustedClick(
    cdp,
    sessionId,
    selectorPoint(`document.querySelector('button[aria-label="Search"]')`),
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
  await trustedClick(
    cdp,
    sessionId,
    selectorPoint(`document.querySelector(${JSON.stringify(`a[href="${href}"]`)})`),
    'Search result',
  );
  await expectUrl(cdp, sessionId, new URL(href, BASE), 'search result destination');
  assert.notEqual(await evaluate(cdp, sessionId, `location.pathname`), '/');
  console.log('browser-smoke: PASS Search open/Escape/result trusted routing');
}

async function auditTheme(cdp, sessionId) {
  await navigate(cdp, sessionId, '/about');
  for (const name of ['Dark', 'Light', 'System']) {
    await trustedClick(
      cdp,
      sessionId,
      selectorPoint(`document.querySelector('button[aria-label="Theme Menu"]')`),
      `Theme menu ${name}`,
    );
    await trustedClick(
      cdp,
      sessionId,
      selectorPoint(
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
  const [titleFamily, contentFamily, paragraphFamily, headingFamily] = metrics.families;
  assert.equal(titleFamily, headingFamily, `editorial fonts diverged: ${metrics.families.join(' | ')}`);
  assert.equal(contentFamily, paragraphFamily, `reading fonts diverged: ${metrics.families.join(' | ')}`);
  assert.notEqual(titleFamily, contentFamily, `editorial/reading fonts collapsed: ${titleFamily}`);
  assert.match(titleFamily, /Iowan Old Style|Noto Serif KR|Nanum Myeongjo|Georgia/i);
  assert.match(contentFamily, /Noto Sans KR|Apple SD Gothic Neo|Malgun Gothic/i);
  assert.ok(metrics.weight >= 700);
  assert.equal(metrics.overflow, false);
  console.log(`browser-smoke: PASS About editorial/reading typography (${titleFamily} | ${contentFamily})`);
}

export async function auditInteractions(cdp, sessionId) {
  await viewport(cdp, sessionId, { width: 1440, height: 900 });
  let clicks = 0;
  for (const route of ROUTES) clicks += await auditRoute(cdp, sessionId, route);
  assert.ok(clicks >= 30, `too few internal controls audited: ${clicks}`);
  await auditSearch(cdp, sessionId);
  await auditTheme(cdp, sessionId);
  await auditAboutFont(cdp, sessionId);
  return clicks;
}
