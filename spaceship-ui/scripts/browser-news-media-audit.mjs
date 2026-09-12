import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BASE, evaluate, navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

export async function auditNewsMedia(cdp, sessionId) {
  const media = JSON.parse(
    fs.readFileSync(new URL('../site/news-media.json', import.meta.url), 'utf8')
  );
  const covers = JSON.parse(fs.readFileSync(new URL('../site/news-covers-20260912.json', import.meta.url), 'utf8'));
  assert.equal(covers.entries.length, 19);
  const sep11 = JSON.parse(fs.readFileSync(new URL('../site/news-sep11-release.json', import.meta.url), 'utf8'));
  const sourceFigurePosts = new Map(sep11.entries.map((row) => [row.slug, row]));
  const sourceCards = sep11.entries.map((row) => ({slug: row.slug, ...media[row.mediaIds[0]]}));
  const coverOnly = new Set(covers.entries.filter((r) => !r.legacyVisualSuite).map((r) => r.slug));
  // Media registration does not publish a post. Validate source state first,
  // then require published images and reject draft listing/route exposure.
  const draftSlugs = new Set();
  const publicationState = new Map();
  for (const item of Object.values(media)) {
    assert.match(item.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'News media slug must be path-safe');
    if (publicationState.has(item.slug)) continue;
    const source = fs.readFileSync(
      new URL(`../site/content/posts/${item.slug}.mdx`, import.meta.url), 'utf8'
    );
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert(frontmatter, `${item.slug}: missing source frontmatter`);
    const draftFields = [...frontmatter[1].matchAll(/^draft:\s*(true|false)\s*$/gm)];
    assert.equal(draftFields.length, 1, `${item.slug}: exactly one explicit draft boolean required`);
    const isDraft = draftFields[0][1] === 'true';
    publicationState.set(item.slug, isDraft);
    if (isDraft) draftSlugs.add(item.slug);
  }
  const publishedMedia = Object.entries(media).filter(([, item]) => !publicationState.get(item.slug));
  assert(publishedMedia.length > 0, 'Published News image coverage must not become empty');
  const sizes = [
    { width: 390, height: 844, mobile: true, touch: true, reduced: true },
    { width: 1440, height: 1000, reduced: true },
  ];
  const results = [];
  for (const size of sizes) {
    await viewport(cdp, sessionId, size);
    await navigate(cdp, sessionId, '/news');
    const links = await evaluate(
      cdp,
      sessionId,
      `Array.from(document.querySelectorAll('[data-news-card]')).map((node) => node.getAttribute('data-news-card'))`
    );
    for (const [, item] of publishedMedia)
      assert(links.includes(item.slug), `News listing missing ${item.slug}`);
    for (const slug of draftSlugs) {
      assert(!links.includes(slug), `Draft leaked into News listing: ${slug}`);
      const draftResponse = await fetch(new URL(`/posts/${slug}/`, BASE), { redirect: 'manual' });
      assert.equal(draftResponse.status, 404, `Draft route must remain unpublished: ${slug}`);
      console.log(`news-media-qa: PASS draft excluded ${slug} at ${size.width}px`);
    }
    for (const row of [...covers.entries, ...sourceCards]) {
      await evaluate(cdp, sessionId, `document.querySelector('[data-news-card="${row.slug}"]').scrollIntoView({block:'center',behavior:'instant'})`);
      const card = await waitExpression(cdp, sessionId, `(() => {
        const card = document.querySelector('[data-news-card="${row.slug}"]');
        const img = card?.querySelector('figure.news-figure img');
        const title = card?.querySelector('[data-post-transition-title]');
        if (!img || !title || !img.complete || !img.naturalWidth) return null;
        const ir = img.getBoundingClientRect(), tr = title.getBoundingClientRect();
        return {width:img.naturalWidth,height:img.naturalHeight,src:img.getAttribute('src'),
          before:Boolean(img.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING),
          positioned:innerWidth <= 640 ? ir.bottom <= tr.top + 2 : ir.right <= tr.left + 2,
          overflow:document.documentElement.scrollWidth > innerWidth + 2};
      })()`, `cover decoded ${row.slug}`, 20000);
      assert(card.before && card.positioned && !card.overflow, JSON.stringify(card));
      assert.equal(card.src, row.src); assert.equal(card.width, row.width); assert.equal(card.height, row.height);
      console.log(`news-cover-qa: PASS ${row.slug} at ${size.width}px`);
    }
    for (const [id, item] of publishedMedia) {
      const declaredSource = sourceFigurePosts.get(item.slug);
      const minFigures = declaredSource ? declaredSource.mediaIds.length : (coverOnly.has(item.slug) ? 1 : 3);
      const minDiagrams = declaredSource ? 0 : (coverOnly.has(item.slug) ? 0 : 2);
      const route = `/posts/${item.slug}/`;
      const response = await fetch(new URL(route, BASE));
      assert.equal(response.status, 200, `Published route ${route}`);
      await navigate(cdp, sessionId, route);
      await waitExpression(
        cdp,
        sessionId,
        `Boolean(document.querySelector('article [data-news-figure="${id}"] img'))`,
        `inline image ${item.slug}`
      );
      await waitExpression(
        cdp,
        sessionId,
        `document.querySelectorAll('article figure.news-figure img').length >= ${minFigures}`,
        `required visuals ${item.slug}`
      );
      const imageCount = await evaluate(
        cdp,
        sessionId,
        `document.querySelectorAll('article figure.news-figure img').length`
      );
      for (let index = 0; index < imageCount; index += 1) {
        await evaluate(
          cdp,
          sessionId,
          `document.querySelectorAll('article figure.news-figure img')[${index}].scrollIntoView({block:'center',behavior:'instant'})`
        );
        await waitExpression(
          cdp,
          sessionId,
          `(() => { const img = document.querySelectorAll('article figure.news-figure img')[${index}]; return img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0; })()`,
          `decoded image ${item.slug} #${index + 1}`,
          45000
        );
      }
      const result = await evaluate(
        cdp,
        sessionId,
        `(() => {
        const figures = [...document.querySelectorAll('article figure.news-figure')];
        const images = figures.map((figure) => { const img = figure.querySelector('img'); const r = img.getBoundingClientRect(); const style = getComputedStyle(img); return {
          naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, displayedWidth: r.width, displayedHeight: r.height,
          visible: style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && r.width > 0 && r.height > 0,
          caption: Boolean(figure.querySelector('figcaption')) }; });
        return { slug: ${JSON.stringify(item.slug)}, viewport: innerWidth, imageCount: images.length,
          diagramCount: document.querySelectorAll('article [data-news-diagram]').length,
          decoded: images.every((image) => image.naturalWidth > 0 && image.naturalHeight > 0),
          captions: images.every((image) => image.caption),
          overflow: document.documentElement.scrollWidth > innerWidth + 2,
          newsActive: Boolean(document.querySelector('header a[href="/news"][aria-current="page"]')) };
      })()`
      );
      assert(
        result.imageCount >= minFigures &&
          result.diagramCount >= minDiagrams &&
          result.decoded &&
          result.captions &&
          !result.overflow &&
          result.newsActive,
        JSON.stringify(result)
      );
      if (declaredSource) {
        const ids = await evaluate(cdp, sessionId, `Array.from(document.querySelectorAll('article [data-news-figure]')).map((el) => el.getAttribute('data-news-figure'))`);
        assert.deepEqual(ids, declaredSource.mediaIds, 'All declared original figures must appear exactly once in order');
      }
      results.push(result);
      console.log('news-media-qa: PASS ' + JSON.stringify(result));
    }
  }
  console.log(`news-media-qa: PASS ${results.length} live image/viewport checks and ${draftSlugs.size} draft-exclusion case(s) on ${BASE}`);
}
