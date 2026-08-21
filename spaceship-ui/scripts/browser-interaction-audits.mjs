import assert from 'node:assert/strict';
import {
  BASE,
  evaluate,
  navigate,
  viewport,
  waitExpression,
} from './browser-smoke-harness.mjs';

const CORE_ROUTES = ['/', '/research', '/about', '/posts'];

const anchorsExpression = `(() => {
  const visible = (node) => {
    if (node.classList.contains('sr-only')) return false;
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      Number(style.opacity) > 0 &&
      rect.width > 1 &&
      rect.height > 1;
  };

  // SVG research nodes have their own exact four-node click audit. Excluding
  // them here prevents the generic HTML-link audit from double-counting them.
  const anchors = [...document.querySelectorAll('a[href]')]
    .filter((node) => !(node instanceof SVGAElement))
    .filter(visible);

  return anchors.map((anchor, index) => {
    const href = anchor.getAttribute('href');
    const ordinal = anchors
      .slice(0, index)
      .filter((candidate) => candidate.getAttribute('href') === href).length;

    return {
      href,
      ordinal,
      absolute: new URL(href, location.href).href,
      text: (anchor.textContent || '').replace(/\\s+/g, ' ').trim(),
      aria: anchor.getAttribute('aria-label') || '',
      target: anchor.getAttribute('target') || '',
      rel: anchor.getAttribute('rel') || '',
      download: anchor.hasAttribute('download'),
      brand: anchor.hasAttribute('data-site-brand'),
      breadcrumb: anchor.closest('[aria-label="Breadcrumb"]') !== null,
    };
  });
})()`;

function explicitHome(anchor) {
  return (
    anchor.brand ||
    anchor.breadcrumb ||
    /\bhome\b|park\s*jiho/i.test(`${anchor.text} ${anchor.aria}`)
  );
}

async function auditLinks(cdp, sessionId, route) {
  await navigate(cdp, sessionId, route);
  const anchors = await evaluate(cdp, sessionId, anchorsExpression);
  const origin = new URL(BASE).origin;
  let clicked = 0;

  for (let index = 0; index < anchors.length; index += 1) {
    const anchor = anchors[index];
    const label = anchor.text || anchor.aria || anchor.href || `link-${index}`;

    assert.ok(anchor.href, `${route} ${label}: empty href`);
    assert.equal(/^javascript:/i.test(anchor.href), false, `${route} ${label}: javascript URL`);

    const expected = new URL(anchor.absolute);
    const http = ['http:', 'https:'].includes(expected.protocol);
    const internal =
      http &&
      expected.origin === origin &&
      !anchor.download &&
      (!anchor.target || anchor.target === '_self');

    if (!internal) {
      if (http && expected.origin !== origin) {
        assert.equal(anchor.target, '_blank', `${route} ${label}: external link must open a new tab`);
        assert.ok(
          /noopener|noreferrer/.test(anchor.rel),
          `${route} ${label}: external link lacks rel=noopener/noreferrer`,
        );
      } else if (http && anchor.target === '_blank') {
        assert.ok(
          /noopener|noreferrer/.test(anchor.rel),
          `${route} ${label}: target=_blank lacks rel=noopener/noreferrer`,
        );
      }
      continue;
    }

    if (expected.pathname === '/') {
      assert.ok(
        explicitHome(anchor),
        `${route}: unexpected Home target from “${label}”`,
      );
    }

    await navigate(cdp, sessionId, route);
    const activation = await evaluate(cdp, sessionId, `(() => {
      const visible = (node) => {
        if (node.classList.contains('sr-only')) return false;
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) > 0 &&
          rect.width > 1 &&
          rect.height > 1;
      };

      const candidates = [...document.querySelectorAll('a[href]')]
        .filter((node) => !(node instanceof SVGAElement))
        .filter(visible)
        .filter((node) => node.getAttribute('href') === ${JSON.stringify(anchor.href)});
      const target = candidates[${anchor.ordinal}];
      if (!target) {
        return { activated: false, available: candidates.length };
      }

      target.scrollIntoView({ block: 'center', inline: 'nearest' });
      target.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window,
      }));
      return { activated: true, available: candidates.length };
    })()`);

    assert.equal(
      activation?.activated,
      true,
      `${route} ${label}: stable href/ordinal target missing; candidates=${activation?.available ?? 0}`,
    );

    await waitExpression(
      cdp,
      sessionId,
      `location.pathname === ${JSON.stringify(expected.pathname)} &&
       location.search === ${JSON.stringify(expected.search)} &&
       location.hash === ${JSON.stringify(expected.hash)}`,
      `${route} click ${label}`,
    );

    const actual = await evaluate(
      cdp,
      sessionId,
      `location.pathname + location.search + location.hash`,
    );
    assert.equal(
      actual,
      `${expected.pathname}${expected.search}${expected.hash}`,
      `${route} ${label}: wrong destination`,
    );
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

  console.log(`browser-smoke: PASS ${route} visible-link routing (${clicked} internal clicks)`);
  return clicked;
}

async function auditSearch(cdp, sessionId) {
  await navigate(cdp, sessionId, '/');
  await evaluate(
    cdp,
    sessionId,
    `document.querySelector('button[aria-label="Search"]')?.click()`,
  );
  await waitExpression(
    cdp,
    sessionId,
    `Boolean(document.querySelector('input[placeholder^="Search post"]'))`,
    'search dialog open',
  );
  assert.equal(await evaluate(cdp, sessionId, `location.pathname`), '/');

  await cdp.send(
    'Input.dispatchKeyEvent',
    { type: 'keyDown', key: 'Escape', code: 'Escape' },
    sessionId,
  );
  await cdp.send(
    'Input.dispatchKeyEvent',
    { type: 'keyUp', key: 'Escape', code: 'Escape' },
    sessionId,
  );
  await waitExpression(
    cdp,
    sessionId,
    `!document.querySelector('input[placeholder^="Search post"]')`,
    'search dialog Escape close',
  );

  await evaluate(
    cdp,
    sessionId,
    `document.querySelector('button[aria-label="Search"]')?.click()`,
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
  await waitExpression(
    cdp,
    sessionId,
    `Boolean(document.querySelector(${JSON.stringify(`a[href="${href}"]`)}))`,
    'search result',
  );
  await evaluate(
    cdp,
    sessionId,
    `document.querySelector(${JSON.stringify(`a[href="${href}"]`)})?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, view: window })
    )`,
  );
  await waitExpression(
    cdp,
    sessionId,
    `location.pathname === ${JSON.stringify(href)}`,
    'search result navigation',
  );
  assert.notEqual(await evaluate(cdp, sessionId, `location.pathname`), '/');
  console.log('browser-smoke: PASS Search open/Escape/result click routing');
}

async function auditTheme(cdp, sessionId) {
  await navigate(cdp, sessionId, '/about');
  for (const name of ['Dark', 'Light', 'System']) {
    await evaluate(
      cdp,
      sessionId,
      `document.querySelector('button[aria-label="Theme Menu"]')?.click()`,
    );
    await waitExpression(
      cdp,
      sessionId,
      `[...document.querySelectorAll('button')].some(
        (button) => button.textContent.trim() === ${JSON.stringify(name)}
      )`,
      `theme option ${name}`,
    );
    await evaluate(
      cdp,
      sessionId,
      `[...document.querySelectorAll('button')]
        .find((button) => button.textContent.trim() === ${JSON.stringify(name)})
        ?.click()`,
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
  console.log('browser-smoke: PASS Theme controls preserve route and apply Light/Dark/System');
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
  for (const route of CORE_ROUTES) {
    clicks += await auditLinks(cdp, sessionId, route);
  }
  assert.ok(clicks >= 30, `too few internal controls audited: ${clicks}`);
  await auditSearch(cdp, sessionId);
  await auditTheme(cdp, sessionId);
  await auditAboutFont(cdp, sessionId);
  return clicks;
}
