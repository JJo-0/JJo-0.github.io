import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BASE, evaluate, navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

// These two source-led articles use actual research figures and native HTML flows.
// Keep the existing three-image/two-diagram contract unchanged for legacy layouts.
const RESEARCH_LAYOUTS = {
  '2026-09-05-gpt-6-astra-safety-news': { figures: 11, flows: 1, equations: 10 },
  '2026-09-05-aml-paradigm-news': { figures: 6, flows: 3, equations: 3 },
};

export async function auditNewsMedia(cdp, sessionId) {
  const media = JSON.parse(
    fs.readFileSync(new URL('../site/news-media.json', import.meta.url), 'utf8')
  );
  const sizes = [
    { width: 390, height: 844, mobile: true, touch: true, reduced: true },
    { width: 1440, height: 1000, reduced: true },
  ];
  const results = [];
  for (const size of sizes) {
    await viewport(cdp, sessionId, size);
    await navigate(cdp, sessionId, '/news');
    const links = await evaluate(
      cdp, sessionId,
      `Array.from(document.querySelectorAll('[data-news-card]')).map((node) => node.getAttribute('data-news-card'))`
    );
    for (const item of Object.values(media))
      assert(links.includes(item.slug), `News listing missing ${item.slug}`);
    for (const [id, item] of Object.entries(media)) {
      const research = RESEARCH_LAYOUTS[item.slug];
      const figureSelector = research ? 'article figure[data-research-figure]' : 'article figure.news-figure';
      const imageSelector = `${figureSelector} img`;
      const diagramSelector = research ? 'article [data-research-flow]' : 'article [data-news-diagram]';
      const selectorJSON = JSON.stringify(imageSelector);
      const route = `/posts/${item.slug}/`;
      const response = await fetch(new URL(route, BASE));
      assert.equal(response.status, 200, `Published route ${route}`);
      await navigate(cdp, sessionId, route);
      await waitExpression(
        cdp, sessionId,
        research
          ? `[...document.querySelectorAll(${selectorJSON})].some(img => img.getAttribute('src') === ${JSON.stringify(item.src)})`
          : `Boolean(document.querySelector('article [data-news-figure="${id}"] img'))`,
        `inline thumbnail source ${item.slug}`
      );
      await waitExpression(
        cdp, sessionId,
        `document.querySelectorAll(${selectorJSON}).length ${research ? '===' : '>='} ${research?.figures ?? 3}`,
        `complete figure inventory ${item.slug}`
      );
      const imageCount = await evaluate(cdp, sessionId, `document.querySelectorAll(${selectorJSON}).length`);
      for (let index = 0; index < imageCount; index += 1) {
        await evaluate(
          cdp, sessionId,
          `document.querySelectorAll(${selectorJSON})[${index}].scrollIntoView({block:'center',behavior:'instant'})`
        );
        await waitExpression(
          cdp, sessionId,
          `(() => { const img = document.querySelectorAll(${selectorJSON})[${index}]; return img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0; })()`,
          `decoded image ${item.slug} #${index + 1}`, 45000
        );
      }
      const result = await evaluate(
        cdp, sessionId,
        `(() => {
          const figures = [...document.querySelectorAll(${JSON.stringify(figureSelector)})];
          const images = figures.map(figure => {
            const img = figure.querySelector('img');
            const rect = img.getBoundingClientRect();
            const style = getComputedStyle(img);
            return {
              naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
              visible: style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0,
              caption: Boolean(figure.querySelector('figcaption')?.textContent.trim()),
              alt: Boolean(img.alt.trim())
            };
          });
          return {
            slug: ${JSON.stringify(item.slug)}, viewport: innerWidth, imageCount: images.length,
            diagramCount: document.querySelectorAll(${JSON.stringify(diagramSelector)}).length,
            equationCount: document.querySelectorAll('article .math-display').length,
            mathErrors: document.querySelectorAll('article .katex-error').length,
            decoded: images.every(image => image.naturalWidth > 0 && image.naturalHeight > 0),
            captions: images.every(image => image.caption),
            visible: images.every(image => image.visible),
            alternativeText: images.every(image => image.alt),
            overflow: document.documentElement.scrollWidth > innerWidth + 2,
            newsActive: Boolean(document.querySelector('header a[href="/news"][aria-current="page"]'))
          };
        })()`
      );
      assert(
        (research
          ? result.imageCount === research.figures && result.diagramCount === research.flows && result.equationCount >= research.equations
          : result.imageCount >= 3 && result.diagramCount >= 2) &&
          result.decoded && result.captions && result.visible && result.alternativeText &&
          result.mathErrors === 0 && !result.overflow && result.newsActive,
        JSON.stringify(result)
      );
      results.push(result);
      console.log('news-media-qa: PASS ' + JSON.stringify(result));
    }
  }
  console.log(`news-media-qa: PASS ${results.length} live image/viewport checks on ${BASE}`);
}
