import assert from 'node:assert/strict';
import fs from 'node:fs';
import { groupMediaByPost } from './news-media-visit-plan.mjs';
import { BASE, evaluate, navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

export async function auditNewsMedia(cdp, sessionId) {
  const media = JSON.parse(
    fs.readFileSync(new URL('../site/news-media.json', import.meta.url), 'utf8')
  );
  const covers = JSON.parse(fs.readFileSync(new URL('../site/news-covers-20260912.json', import.meta.url), 'utf8'));
  assert.equal(covers.entries.length, 19);
  const sep11 = JSON.parse(fs.readFileSync(new URL('../site/news-sep11-release.json', import.meta.url), 'utf8'));
  const sep15 = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260915.json', import.meta.url), 'utf8'));
  const sep16 = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260916.json', import.meta.url), 'utf8'));
  const sep17 = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260917.json', import.meta.url), 'utf8'));
  const sep18 = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260918.json', import.meta.url), 'utf8'));
  const candidates18 = JSON.parse(fs.readFileSync(new URL('../site/news-candidates-20260918.json', import.meta.url), 'utf8'));
  const wetlab19 = JSON.parse(fs.readFileSync(new URL('../site/news-wetlab-20260919.json', import.meta.url), 'utf8'));
  const candidates19 = JSON.parse(fs.readFileSync(new URL('../site/news-candidates-20260919.json', import.meta.url), 'utf8'));
  const sep20 = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260920.json', import.meta.url), 'utf8'));
  const sep21 = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260921.json', import.meta.url), 'utf8'));
  const sep22 = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260922.json', import.meta.url), 'utf8'));
  const sep23 = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260923.json', import.meta.url), 'utf8'));
  const declaredEntries = [...sep11.entries, ...sep15.entries, ...sep16.entries, ...sep17.entries, sep18, ...candidates18.entries, ...wetlab19.entries, ...candidates19.entries, ...sep20.entries, ...sep21.entries, ...sep22.entries, ...sep23.entries];
  const sourceFigurePosts = new Map(declaredEntries.map((row) => [row.slug, row]));
  const sourceCards = declaredEntries.map((row) => ({slug: row.slug, ...media[row.mediaIds[0]]}));
  const coverOnly = new Set(covers.entries.filter((r) => !r.legacyVisualSuite).map((r) => r.slug));
  // Most legacy NEWS explainers pair one source figure with two NewsDiagram
  // components. JustGRPO instead uses two credited source PNGs plus two
  // clearly labelled educational SVGs rendered through NewsFigure so every
  // visual receives the same source, licence and caption treatment.
  const visualPolicies = new Map([
    ['2026-09-14-justgrpo-diffusion-reasoning-news', { minFigures: 4, minDiagrams: 0 }],
    ['2026-09-14-fors-diffusion-sampling-news', { minFigures: 2, minDiagrams: 0 }],
    ['2026-09-14-d4rt-dynamic-4d-vision-news', { minFigures: 2, minDiagrams: 0 }],
  ]);
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
  const publishedPosts = groupMediaByPost(publishedMedia);
  let checkedMedia = 0;
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
    for (const [, registeredMedia] of publishedPosts) {
      const [, item] = registeredMedia[0];
      const declaredSource = sourceFigurePosts.get(item.slug);
      const visualPolicy = visualPolicies.get(item.slug);
      const minFigures = visualPolicy?.minFigures ?? (declaredSource ? declaredSource.mediaIds.length : (coverOnly.has(item.slug) ? 1 : 3));
      const minDiagrams = visualPolicy?.minDiagrams ?? (declaredSource ? 0 : (coverOnly.has(item.slug) ? 0 : 2));
      const route = `/posts/${item.slug}/`;
      const response = await fetch(new URL(route, BASE));
      assert.equal(response.status, 200, `Published route ${route}`);
      await navigate(cdp, sessionId, route);
      // One navigation per article; every registered figure is still required.
      for (const [id] of registeredMedia) {
        await waitExpression(
          cdp,
          sessionId,
          `document.querySelectorAll('article [data-news-figure="${id}"] img').length === 1`,
          `inline image ${item.slug}: ${id}`
        );
      }
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
      const registeredDetails = await evaluate(cdp, sessionId, `Array.from(document.querySelectorAll('article [data-news-figure]')).map((figure) => {
        const img = figure.querySelector('img');
        return { id: figure.getAttribute('data-news-figure'), src: img?.getAttribute('src'),
          width: img?.naturalWidth, height: img?.naturalHeight,
          declaredWidth: Number(img?.getAttribute('width')), declaredHeight: Number(img?.getAttribute('height')) };
      })`);
      for (const [id, expected] of registeredMedia) {
        const matches = registeredDetails.filter((figure) => figure.id === id);
        assert.equal(matches.length, 1, `${item.slug}: exactly one registered figure ${id}`);
        assert.equal(matches[0].src, expected.src);
        assert.equal(matches[0].declaredWidth, expected.width);
        assert.equal(matches[0].declaredHeight, expected.height);
        // Pixel equality applies to pinned local rasters. SVGs scale from
        // viewBox/point units; remote servers may return other renditions.
        if (expected.src.startsWith('/') && /\.(?:png|jpe?g|webp|gif|avif)$/i.test(expected.src)) {
          assert.equal(matches[0].width, expected.width);
          assert.equal(matches[0].height, expected.height);
        }
        assert(matches[0].width > 0 && matches[0].height > 0, `${id}: undecoded image`);
        checkedMedia += 1;
      }
      if (declaredSource) {
        const ids = await evaluate(cdp, sessionId, `Array.from(document.querySelectorAll('article [data-news-figure]')).map((el) => el.getAttribute('data-news-figure'))`);
        assert.deepEqual(ids, declaredSource.mediaIds, 'All declared original figures must appear exactly once in order');
      }
      const todayEntry = [...sep15.entries, ...sep16.entries, ...sep17.entries, sep18, ...candidates18.entries, ...wetlab19.entries, ...candidates19.entries, ...sep20.entries, ...sep21.entries, ...sep22.entries].find((row) => row.slug === item.slug);
      if (todayEntry) {
        const details = await evaluate(cdp, sessionId, `(() => {
          const figures = [...document.querySelectorAll('article [data-news-figure]')];
          const heading = document.querySelector('article h2');
          return {
            firstBeforeHeading: Boolean(heading && (figures[0].compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING)),
            media: figures.map((figure) => {
              const img = figure.querySelector('img');
              return { id: figure.getAttribute('data-news-figure'), src: img.getAttribute('src'),
                width: img.naturalWidth, height: img.naturalHeight,
                kind: figure.querySelector('figcaption strong')?.textContent || '' };
            })
          };
        })()`);
        assert(details.firstBeforeHeading, `${item.slug}: representative image must precede explanatory sections`);
        assert.deepEqual(details.media.map((row) => row.id), todayEntry.mediaIds);
        for (const row of details.media) {
          const original = media[row.id];
          assert.equal(row.src, original.src);
          assert.equal(row.width, original.width);
          assert.equal(row.height, original.height);
          assert.equal(row.kind, original.kind);
        }
        console.log(`news-sep15-qa: PASS ${item.slug} original decode, order, captions and ${size.width}px layout`);
      }
      results.push(result);
      console.log('news-media-qa: PASS ' + JSON.stringify(result));
    }
  }
  assert.equal(results.length, publishedPosts.size * sizes.length, 'Every published article and viewport must be checked');
  assert.equal(checkedMedia, publishedMedia.length * sizes.length, 'Every registered media ID and viewport must be checked');
  console.log(`news-media-qa: PASS ${checkedMedia} registered image/viewport checks in ${results.length} article visits and ${draftSlugs.size} draft-exclusion case(s) on ${BASE}`);
}
