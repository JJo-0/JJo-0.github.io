import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const issues = [];
const fail = (message) => issues.push(message);
const expected = {
  6: {
    pages: 29,
    size: 9611430,
    sha: '481015c79d84c0e4e14450fb770541ce723fb80ddb771836cc21df1ee7d07a90',
    formulas: 10,
    sections: 7,
    visuals: ['dense-prediction', 'encoder-decoder', 'unet-skip', 'atrous-pyramid', 'mrf-icm'],
    links: ['1411.4038', '1505.04597', '1612.01105', '1706.05587', '1802.02611'],
    opening: '6.1 분류에서 dense prediction으로',
  },
  7: {
    pages: 35,
    size: 4849675,
    sha: 'f98b24879c10e0a5a67d53b8657b0eaf0b5046cb68de505e1423266335be0ff1',
    formulas: 14,
    sections: 8,
    visuals: ['denoising-estimator', 'vae', 'diffusion', 'guidance', 'latent-diffusion'],
    links: ['1312.6114', '2006.11239', '2207.12598', '2112.10752', '2011.13456'],
    opening: '7.1 잡음제거를 추정 문제로 보기',
  },
  8: {
    pages: 21,
    size: 5827936,
    sha: 'c0a07b5b8b18a832a845e8a116f08c7ece96fe6cf0a63e06e3d8f5b55340edde',
    formulas: 10,
    sections: 6,
    visuals: ['contrastive-objective', 'simclr', 'noncontrastive', 'moco', 'clip'],
    links: [
      '1807.03748',
      '2002.05709',
      '2103.03230',
      '2006.07733',
      '1911.05722',
      '1807.05520',
      '2006.09882',
      '2004.11362',
      '2103.00020',
    ],
    opening: '8.1 metric learning에서 contrastive learning으로',
  },
};

const readJson = (part, name) =>
  JSON.parse(
    fs.readFileSync(path.join(root, 'src', 'data', `modern-ai-part${part}`, name), 'utf8')
  );
const range = (count) => Array.from({ length: count }, (_, index) => index + 1);
const sameNumbers = (left, right) =>
  JSON.stringify([...left].sort((a, b) => a - b)) ===
  JSON.stringify([...right].sort((a, b) => a - b));

for (const [partText, contract] of Object.entries(expected)) {
  const part = Number(partText);
  const sourceAudit = readJson(part, 'source-audit.json');
  const pageLedger = readJson(part, 'page-ledger.json');
  const formulaLedger = readJson(part, 'formula-ledger.json');
  const contentLedger = readJson(part, 'content-ledger.json');
  const visualLedger = readJson(part, 'visual-ledger.json');
  const annotationLedger = readJson(part, 'annotation-ledger.json');
  const articlePath = path.join(
    root,
    'site',
    'content',
    'posts',
    `modern-artificial-intelligence-${part}.mdx`
  );
  const article = fs.readFileSync(articlePath, 'utf8');

  if (
    sourceAudit.source.sha256 !== contract.sha ||
    sourceAudit.source.sizeBytes !== contract.size ||
    sourceAudit.source.pages !== contract.pages
  )
    fail(`Part ${part}: source identity mismatch`);
  if (
    !sourceAudit.sourceComplete ||
    !sourceAudit.renderInspection.allPagesInspected ||
    sourceAudit.renderInspection.pagesInspected !== contract.pages ||
    !sourceAudit.renderInspection.textCrossChecked
  )
    fail(`Part ${part}: source inspection incomplete`);
  if (
    sourceAudit.readerSurfacePolicy !==
    'source markers and ledgers stay in source; audit and provenance prose must not render'
  )
    fail(`Part ${part}: reader-surface policy drift`);

  const pages = pageLedger.pages ?? [];
  if (
    pages.length !== contract.pages ||
    !sameNumbers(
      pages.map((entry) => entry.pdfPage),
      range(contract.pages)
    )
  )
    fail(`Part ${part}: page ledger must enumerate every source page`);
  for (const page of pages)
    if (page.status !== 'rendered-inspected' || page.textCrossChecked !== true || !page.topic)
      fail(`Part ${part}: page ${page.pdfPage} inspection record incomplete`);

  const formulas = formulaLedger.formulas ?? [];
  if (formulaLedger.formulaCount !== contract.formulas || formulas.length !== contract.formulas)
    fail(`Part ${part}: formula count mismatch`);
  for (const [index, formula] of formulas.entries()) {
    const id = `MAI-P${part}-${String(index + 1).padStart(3, '0')}`;
    if (formula.id !== id) fail(`Part ${part}: formula IDs must be sequential at ${id}`);
    if (formula.page < 1 || formula.page > contract.pages)
      fail(`${formula.id}: source page out of range`);
    const hash = crypto.createHash('sha256').update(formula.tex, 'utf8').digest('hex');
    if (hash !== formula.hash) fail(`${formula.id}: TeX hash mismatch`);
    if (!article.includes(`modernAiFormula(${part}, '${formula.id}')`))
      fail(`${formula.id}: article reference missing`);
  }

  if (
    (contentLedger.records ?? []).length !== contract.sections ||
    !sameNumbers(contentLedger.coveredPages ?? [], range(contract.pages))
  )
    fail(`Part ${part}: content ledger coverage mismatch`);
  const contentPages = new Set((contentLedger.records ?? []).flatMap((entry) => entry.pages));
  if (!sameNumbers(contentPages, range(contract.pages)))
    fail(`Part ${part}: content records do not cover every page`);
  for (const record of contentLedger.records ?? [])
    if (!article.includes(`source-content:${record.id}`))
      fail(`${record.id}: source marker missing`);

  const visualKinds = (visualLedger.records ?? []).map((entry) => entry.kind);
  if (JSON.stringify(visualKinds) !== JSON.stringify(contract.visuals))
    fail(`Part ${part}: visual ledger mismatch`);
  for (const record of visualLedger.records ?? []) {
    if (!article.includes(`source-visual:${record.id}`))
      fail(`${record.id}: visual marker missing`);
    if (!article.includes(`<ModernAiConceptVisual kind="${record.kind}"`))
      fail(`${record.id}: code-drawn reader visual missing`);
  }

  if (
    annotationLedger.pagesReviewed !== contract.pages ||
    !Array.isArray(annotationLedger.pagesWithVisibleHandwriting)
  )
    fail(`Part ${part}: annotation review incomplete`);
  if (!article.includes(`source-annotation:P${part}-ANNOTATION-LEDGER`))
    fail(`Part ${part}: annotation ledger marker missing`);
  for (const page of range(contract.pages))
    if (!article.includes(`source-page:P${part}-P${String(page).padStart(2, '0')}`))
      fail(`Part ${part}: source page marker ${page} missing`);
  for (const link of contract.links)
    if (!article.includes(link)) fail(`Part ${part}: primary-paper link ${link} missing`);

  for (const forbidden of [
    '완전성 계약',
    '원장 현황',
    'PDF SHA-256',
    'PDF 원자료 재구성',
    '그림 원자료.',
    '강의자 필기',
    'PDF p.',
  ])
    if (article.includes(forbidden))
      fail(`Part ${part}: reader-facing audit boilerplate in article source: ${forbidden}`);

  if (fs.existsSync(path.join(root, 'dist'))) {
    const renderedPath = path.join(
      root,
      'dist',
      'posts',
      `2026-08-25-modern-artificial-intelligence-${part}`,
      'index.html'
    );
    if (!fs.existsSync(renderedPath)) fail(`Part ${part}: rendered output missing`);
    else {
      const html = fs.readFileSync(renderedPath, 'utf8');
      const visible = html.replace(/<!--[^]*?-->/g, '').replace(/<[^>]+>/g, ' ');
      if (!visible.includes(contract.opening))
        fail(`Part ${part}: substantive opening missing in rendered output`);
      const renderedFormulas = [
        ...html.matchAll(new RegExp(`data-formula-id="(MAI-P${part}-\\d{3})"`, 'g')),
      ].map((match) => match[1]);
      if (
        renderedFormulas.length !== contract.formulas ||
        new Set(renderedFormulas).size !== contract.formulas
      )
        fail(`Part ${part}: rendered formula coverage mismatch`);
      for (const kind of contract.visuals)
        if (!html.includes(`data-visual-kind="${kind}"`))
          fail(`Part ${part}: rendered visual ${kind} missing`);
      for (const forbidden of [
        '완전성 계약',
        '원장 현황',
        'PDF SHA-256',
        'PDF 원자료 재구성',
        '그림 원자료.',
        '강의자 필기',
        'PDF p.',
      ])
        if (visible.includes(forbidden)) fail(`Part ${part}: rendered audit residue ${forbidden}`);
    }
  }
}

const unique = [...new Set(issues)].sort();
if (unique.length) {
  console.error(`modern-ai-parts6-8-audit: found ${unique.length} issue(s):`);
  for (const issue of unique) console.error(`  - ${issue}`);
  process.exit(1);
}
console.log(
  'modern-ai-parts6-8-audit: PASS (85/85 source pages; 34 key equations; 15 code-drawn visuals; source-only provenance and annotations)'
);
