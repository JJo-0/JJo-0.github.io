import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  Cdp,
  BASE,
  attach,
  evaluate,
  navigate,
  viewport,
  waitExpression,
  startPreview,
  startChrome,
  stopChild,
  removeProfile,
} from './browser-smoke-harness.mjs';

const articles = [
  {
    route: '/posts/2026-09-23-nioh2-electrochemical-dac-news/',
    title: '공기 중 CO₂를 배터리처럼 뽑아냈다',
    figures: ['sep23-dac-fig-1', 'sep23-dac-fig-2', 'sep23-dac-fig-3', 'sep23-dac-fig-4'],
    equations: ['dac-nernst', 'dac-nickel-redox', 'dac-energy'],
    sourceLinks: 2,
  },
  {
    route: '/posts/2026-09-23-vc-mram-ising-machine-news/',
    title: '9만 6천 개 자석 스핀이 배선 문제를 푼다',
    figures: ['sep23-mram-fig-1', 'sep23-mram-fig-2', 'sep23-mram-fig-3', 'sep23-mram-fig-4'],
    equations: ['mram-ising', 'mram-switch', 'mram-efficiency'],
    sourceLinks: 3,
  },
  {
    route: '/posts/2026-09-23-herbot-her2-biliary-cancer-news/',
    title: 'HER2 양성 담도암 4제 병용, 55% 반응률을 읽는 법',
    figures: [
      'sep23-herbot-fig-1',
      'sep23-herbot-fig-2',
      'sep23-herbot-fig-3',
      'sep23-herbot-fig-4',
    ],
    equations: ['herbot-orr', 'herbot-km', 'herbot-hr'],
    sourceLinks: 3,
  },
];
const out = 'sep23-review';
fs.mkdirSync(out, { recursive: true });
let cdp, sessionId, preview, chrome;
const deadline = setTimeout(() => {
  console.error('sep23-browser: FAIL hard timeout');
  process.exit(1);
}, 180_000);
try {
  preview = await startPreview();
  chrome = await startChrome();
  cdp = await Cdp.connect(chrome.url);
  ({ sessionId } = await attach(cdp, { normalizeHistoryPath: false }));
  for (const article of articles)
    for (const width of [390, 1440])
      for (const dark of [false, true]) {
        await viewport(cdp, sessionId, { width, height: 900, mobile: width < 500, dark });
        await navigate(cdp, sessionId, `${BASE}${article.route}`);
        await waitExpression(
          cdp,
          sessionId,
          `document.readyState==='complete'&&document.fonts.status==='loaded'`,
          'page and fonts'
        );
        for (const id of article.figures) {
          await evaluate(
            cdp,
            sessionId,
            `document.querySelector('[data-news-figure="${id}"]').scrollIntoView({block:'center',behavior:'instant'})`
          );
          await waitExpression(
            cdp,
            sessionId,
            `(()=>{const i=document.querySelector('[data-news-figure="${id}"] img');return i?.complete&&i.naturalWidth>0&&i.naturalHeight>0;})()`,
            `decoded ${id}`
          );
        }
        const result = await evaluate(
          cdp,
          sessionId,
          `(()=>{
      const figures=[...document.querySelectorAll('[data-news-figure]')];
      const images=figures.map(f=>f.querySelector('img'));
      const horizontal=document.documentElement.scrollWidth-document.documentElement.clientWidth;
      return {
        figures:figures.map(f=>f.dataset.newsFigure),
        imageSizes:images.map(i=>[i.complete,i.naturalWidth,i.naturalHeight]),
        equations:[...document.querySelectorAll('[data-candidate-equation]')].map(e=>e.dataset.candidateEquation),
        katexErrors:document.querySelectorAll('.katex-error').length,
        horizontal,
        title:document.querySelector('h1')?.textContent?.trim(),
        sourceLinks:document.querySelectorAll('[data-news-reference]').length
      };
    })()`
        );
        assert.deepEqual(result.figures, article.figures);
        assert(result.imageSizes.every(([done, w, h]) => done && w > 0 && h > 0));
        assert.deepEqual(result.equations, article.equations);
        assert.equal(result.katexErrors, 0);
        assert(result.horizontal <= 1, `overflow ${result.horizontal}px`);
        assert.equal(result.title, article.title);
        assert.equal(result.sourceLinks, article.sourceLinks);
        const first = await evaluate(
          cdp,
          sessionId,
          `(()=>{const d=document.querySelector('[data-candidate-equation]');d.open=true;return d.open&&d.getBoundingClientRect().width<=innerWidth;})()`
        );
        assert(first);
        const { data } = await cdp.send(
          'Page.captureScreenshot',
          { format: 'png', captureBeyondViewport: false },
          sessionId
        );
        const slug = article.route.split('/').filter(Boolean).at(-1);
        fs.writeFileSync(
          `${out}/${slug}-${width}-${dark ? 'dark' : 'light'}.png`,
          Buffer.from(data, 'base64')
        );
      }
  console.log(
    'sep23-browser: PASS 3 articles × 4 viewport/theme cases; 12 images decoded, 9 equations rendered, no horizontal overflow'
  );
} finally {
  clearTimeout(deadline);
  cdp?.close();
  await stopChild(chrome?.child);
  await stopChild(preview);
  if (chrome?.profile) removeProfile(chrome.profile);
}
