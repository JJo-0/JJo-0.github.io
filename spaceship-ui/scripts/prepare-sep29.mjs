// Mechanically register inspected source figures and derive publication identities.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const write = (p, v) => fs.writeFileSync(new URL(p, root), JSON.stringify(v, null, 2) + '\n');
const hash = (b) => crypto.createHash('sha256').update(b).digest('hex');
const slug = '2026-09-29-agent-thermostable-mrna-vaccine-news';
const preprint = 'https://www.biorxiv.org/content/10.64898/2026.09.17.752370v1';
const pdf = preprint + '.full.pdf';
const checkedAt = '2026-09-29';
const specs = [
  [
    1,
    13,
    '진공건조 뒤 다시 물에 풀어 시험하는 과정과 LNP·첨가제·완충액별 발광 비교 원본 도판',
    'b는 공정, e는 조합별 세포 발광이다. 같은 보존제도 LNP와 완충액에 따라 결과가 달라진다. 예방률 그래프가 아니다.',
    'Vacuum drying, reconstitution, and formulation-dependent luminescence',
  ],
  [
    2,
    14,
    '가우시안 과정과 기대 개선량을 이용한 제형 추천·실험·모델 갱신 및 탐색 결과 원본 도판',
    'a는 문제 정의, b는 모델과 실제 실험의 반복, c는 후보와 동물 검증, e·f는 탐색 결과다. 한 iteration에는 여러 시료가 있다.',
    'Gaussian-process and expected-improvement experiment loop',
  ],
  [
    3,
    15,
    '두 LNP 조성의 세포·동물 발광, RNA 포집률, 실제 cryo-TEM 및 성분 제거 실험 원본 도판',
    'a–f는 LNP A, g–l는 B다. 발광·포집률·입자 크기·성분 제거 결과를 구분하며, 현미경 삽입 사진은 실제 연구 자료다.',
    'Cell and animal luminescence, encapsulation, cryo-TEM, and component removal',
  ],
  [
    5,
    18,
    '실제 미세바늘 패치와 비인간 영장류 피부 염색 사진 및 쥐·영장류 면역반응 원본 도판',
    'd는 실제 패치·피부 염색 사진이다. a–c는 쥐, e–g는 영장류 시험이며 항체·결합 억제를 인간 예방률로 읽지 않는다.',
    'Actual microneedle patch photos and preclinical immune responses',
  ],
];
const media = JSON.parse(read('site/news-media.json'));
const english = JSON.parse(read('site/news-media-en.json'));
const assets = specs.map(([n, page, alt, caption, en], index) => {
  const id = `sep29-agent-fig${n}`;
  const src = `/assets/posts/news-20260929/originals/agent-fig${n}.png`;
  const b = fs.readFileSync(new URL(`site/assets${src}`, root));
  const item = {
    slug,
    order: index + 1,
    src,
    width: b.readUInt32BE(16),
    height: b.readUInt32BE(20),
    alt,
    kind: `저자 공개 원고 Figure ${n} · ${n === 5 ? '실제 패치 사진·동물 면역반응' : n === 3 ? '실제 측정·현미경 자료' : '연구 설계·측정 도판'}`,
    caption,
    credit: `Jinbi Tian, Khanh T. M. Tran et al. · bioRxiv v1 · Figure ${n}`,
    source: `${pdf}#page=${page}`,
    rights: 'https://creativecommons.org/licenses/by/4.0/',
    license: 'CC BY 4.0 · 공개 원고 v1',
    changes: 'PDF 그림 영역 PNG 렌더링; 전체 패널·축·사진·점 유지; 주변 본문 제외',
    originalUrl: pdf,
    sha256: hash(b),
    checkedAt,
    rightsStatus: 'LICENSE_CHECKED',
    commercialUse: true,
    modificationAllowed: true,
    expiry: null,
  };
  media[id] = item;
  english[id] = {
    alt: en,
    kind: `Author preprint Figure ${n}`,
    caption: en + '. Preclinical evidence, not human vaccine efficacy.',
    credit: item.credit,
    license: 'CC BY 4.0 · preprint v1',
    changes: 'PDF figure region rendered as PNG; panels, axes and measurements unchanged.',
  };
  return { id, ...item, sourceLocator: `bioRxiv v1 PDF p.${page}, Figure ${n}` };
});
write('site/news-media.json', media);
write('site/news-media-en.json', english);
write('site/news-media-provenance-20260929.json', {
  checkedAt,
  scope: 'Sep 29 AGENT representative article; GitBlog and Blogger',
  rightsEvidence: [
    {
      url: pdf,
      locator: 'Every PDF page header: CC-BY 4.0 International license',
      license: 'CC BY 4.0',
      commercial: true,
      adaptation: true,
      status: 'LICENSE_CHECKED',
    },
    {
      url: 'https://www.nature.com/articles/s41587-026-03331-w',
      locator: 'Rights and permissions',
      license: 'Exclusive publisher rights',
      status: 'PUBLISHER_IMAGES_NOT_REUSED',
    },
  ],
  assets,
});
const source = read(`site/content/posts/${slug}.mdx`);
const body = source
  .split('---')
  .slice(2)
  .join('---')
  .replace(/^import .*?;\s*/gm, '')
  .replace(/<CandidateEquation\b[^\n]+>/g, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\[\d+\]/g, '')
  .replace(/[*#|`>]+/g, '')
  .replace(/\s+/g, ' ')
  .trim();
const counts = {};
for (const m of source.matchAll(/<Cite n=\{(\d+)\}\s*\/>/g)) counts[m[1]] = (counts[m[1]] || 0) + 1;
write('site/news-edition-20260929.json', {
  date: checkedAt,
  selectionRecord:
    'User-provided Sep 29 AGENT selection. Primary sources checked; score not independently rescored. LC-1 and silicon battery candidates remain research-only, not published.',
  entries: [
    {
      key: 'agent',
      slug,
      title: 'AI가 고른 보존제, mRNA 백신은 더위를 버틸까',
      order: 1,
      sha256: hash(source),
      bodyCharacters: body.length,
      equations: [...source.matchAll(/<CandidateEquation id="([^"]+)"/g)].map((m) => m[1]),
      tableIds: ['agent-evidence-boundaries'],
      primerSelector: 'data-agent-primer',
      mediaIds: assets.map((a) => a.id),
      referenceCount: 5,
      citationCounts: counts,
      sourcePublished: '2026-09-28',
      sourceVersion: 'Version of Record metadata + author preprint v1 for full-text access',
      doi: '10.1038/s41587-026-03331-w',
      evidenceGrade: 'PEER_REVIEWED_FRONTIER',
      providedEditorialScore: 98,
      scoreOrigin: 'user supplied',
    },
  ],
});
const locate = (location, url = preprint) => ({
  url,
  location,
  version: url === preprint ? 'v1, 2026-09-18' : 'Version of Record supplement, 2026-09-28',
  checkedAt,
});
const cards = [
  {
    id: 'agent-normalized-activity',
    classification: 'evaluation-metric',
    latex: String.raw`R=100 L_{dry}/L_{solution}`,
    sourceLocator: locate(
      'p.13 Figure 1 and p.15–16 Figure 3 captions; educational definition, not a numbered paper equation'
    ),
    variables: {
      R: 'dimensionless percent',
      Ldry: 'luminescence in the corresponding assay units',
      Lsolution: 'same assay units; matched soluble control',
    },
    assumptions: ['matched dosage, cell context, normalization and measurement time'],
    boundaryConditions: ['not prevention rate; not cross-assay interchangeable'],
    prerequisites: ['ratio', 'percent'],
    baselineMethods: ['single-excipient', 'manual combination'],
    changedTerm: 'No new equation; formulation changes measured activity',
    mathematicalConsequence: 'dimensionless normalized comparison',
    empiricalConsequence: 'in-vitro selection readout',
    solved: 'improved measured recovery within tested conditions',
    unsolved: 'human efficacy and complete product stability',
    confidence: 'high',
    checkedAt,
  },
  {
    id: 'agent-gp-posterior',
    classification: 'estimator',
    latex: String.raw`\mu=k_x^T(K+\sigma_n^2I)^{-1}y; s^2=k(x,x)-k_x^T(K+\sigma_n^2I)^{-1}k_x`,
    sourceLocator: locate(
      'p.5–6 GP use; standard zero-mean independent-Gaussian-noise educational formulation'
    ),
    implementationLocator: {
      url: 'https://github.com/yunshengtian/AutoOED/blob/master/autooed/mobo/surrogate_model/gp.py',
      location: 'GaussianProcess._evaluate: mean/variance; not an exact AGENT run reconstruction',
      checkedAt,
    },
    variables: {
      x: '5 concentration coordinates; match normalized or physical scale',
      y: 'n objective values',
      K: 'n×n covariance; objective units squared',
      kx: 'n-vector covariance',
      sigmaN2: 'educational observation-noise variance; not a verified AGENT value',
      I: 'n×n identity',
      mu: 'objective units',
      s2: 'objective units squared',
    },
    assumptions: [
      'chosen covariance',
      'zero prior mean',
      'independent Gaussian observation noise in educational formula',
    ],
    boundaryConditions: ['allowed design domain; not a molecular governing equation'],
    prerequisites: ['vectors', 'matrices', 'variance'],
    baselineMethods: ['random search', 'one-variable-at-a-time'],
    changedTerm: 'Experimental data enters the next selection; no new GP theorem',
    mathematicalConsequence: 'posterior mean and uncertainty',
    empiricalConsequence: 'data-efficient candidate selection',
    solved: 'selection under tested budget',
    unsolved: 'exact run commit, kernel selection and full reproduction',
    confidence: 'standard mathematical identity; medium for exact run correspondence',
    checkedAt,
  },
  {
    id: 'agent-expected-improvement',
    classification: 'objective-for-experiment-selection',
    latex: String.raw`EI=(\mu-f^*)\Phi(z)+s\phi(z); z=(\mu-f^*)/s`,
    sourceLocator: locate(
      'p.6; Figure 2b; standard maximizing expected improvement, educational restatement'
    ),
    implementationLocator: {
      url: 'https://github.com/yunshengtian/AutoOED/blob/master/autooed/mobo/acquisition/ei.py',
      location: 'ExpectedImprovement._evaluate; minimization sign convention',
      checkedAt,
    },
    variables: {
      mu: 'predicted objective',
      fBest: 'best comparison objective',
      s: 'objective standard deviation',
      z: 'dimensionless',
      Phi: 'standard-normal CDF',
      phi: 'standard-normal density',
      EI: 'objective units',
    },
    assumptions: ['Gaussian predictive distribution', 'improvement=max(f-fBest,0)'],
    boundaryConditions: [
      's=0 uses max(mu-fBest,0)',
      'constrained domain',
      'batch/noisy variants not verified',
    ],
    prerequisites: ['probability', 'expected value'],
    baselineMethods: ['random search', 'greedy predicted mean'],
    changedTerm: 'Selection rule uses both model prediction and uncertainty; existing EI algorithm',
    mathematicalConsequence: 'numerically selects promising improvement',
    empiricalConsequence: 'Figure 2f matched-sample comparison',
    solved: 'effective search for this experimental problem',
    unsolved: 'global optimum proof and universal superiority',
    confidence: 'high for EI use; exact implementation version not reconstructed',
    checkedAt,
  },
];
const nodes = [
  ['trigger', 'trigger', '2026-09-28 publication', 'publisher publication date'],
  ['paper', 'paper', 'AGENT', 'p.1–12'],
  ['problem', 'concept', 'drying recovery and storage stability', 'p.4–5'],
  ['method', 'method', 'GP + EI closed-loop experiment selection', 'p.5–6'],
  [
    'claim',
    'claim',
    '37°C activity retention is not human prevention rate',
    'p.1 abstract; p.8 immune-response measurements',
  ],
  ['result', 'result', '6 rounds/48 LNP A and 3 rounds/12 LNP B', 'p.6–7'],
  ['limitation', 'limitation', 'preclinical, no human vaccine efficacy trial', 'p.8–10'],
  ['article', 'article', slug, 'JJo independently written explainer'],
  ...cards.map((c) => [c.id, 'equation', c.id, c.sourceLocator.location]),
  ...assets.map((a) => [a.id, 'figure', a.alt, a.sourceLocator]),
].map(([id, type, label, location]) => ({
  id: id === 'paper' ? 'doi:10.1038/s41587-026-03331-w' : id,
  type,
  label,
  sourceLocator:
    id === 'trigger'
      ? {
          url: 'https://www.nature.com/articles/s41587-026-03331-w',
          location,
          version: 'Version of Record, 2026-09-28',
          checkedAt,
        }
      : id === 'article'
        ? { url: `https://jjo-0.github.io/posts/${slug}/`, location, version: checkedAt, checkedAt }
        : locate(location),
  confidence: 'high',
  checkedAt,
}));
const paperId = 'doi:10.1038/s41587-026-03331-w';
const edges = [
  ['method', 'implemented-by', paperId, 'direct'],
  ['result', 'supported-by', paperId, 'direct'],
  ['claim', 'supported-by', paperId, 'direct'],
  ['article', 'depends-on', paperId, 'editorial'],
  ...cards.map((c) => ['method', 'formulated-by', c.id, 'educational-restatement']),
  ...assets.map((a) => ['method', 'illustrated-by', a.id, 'editorial']),
].map(([from, relation, to, basis]) => ({
  from,
  relation,
  to,
  basis,
  sourceLocator: locate('p.5–10 and Figure 1–5, p.13–18; see linked cards/figures'),
  confidence: basis === 'direct' ? 'high' : 'editorial or standard-formula interpretation',
  checkedAt,
}));
fs.mkdirSync(new URL('ops/blog-harness/research/', root), { recursive: true });
write('ops/blog-harness/research/2026-09-29-agent.handoff.json', {
  contentId: slug,
  date: checkedAt,
  timeZone: 'Asia/Seoul',
  sourcePublished: '2026-09-28',
  doi: '10.1038/s41587-026-03331-w',
  evidenceGrade: 'PEER_REVIEWED_FRONTIER',
  engineeringDepthStatus: 'PASS_WITH_REPRODUCTION_LIMITATION',
  draftLocation: `site/content/posts/${slug}.mdx`,
  sourceFiles: [
    'author preprint v1',
    'published supplementary information',
    'official AutoOED EI and GP implementations',
  ],
  sourceLocators: [
    locate('p.4–12 and Figures 1–5'),
    locate(
      'Supplementary Table 2; Figure 4c',
      'https://media.springernature.com/original/springer-static/esm/art:10.1038%2Fs41587-026-03331-w/MediaObjects/41587_2026_3331_MOESM1_ESM.pdf'
    ),
  ],
  equationCards: cards,
  baselineMethods: [
    'cold storage',
    'lyophilization',
    'single-excipient screening',
    'one-variable-at-a-time',
    'random search',
    'standard GP/EI Bayesian optimization',
  ],
  graphNodes: nodes,
  graphEdges: edges,
  visualPlan: assets.map((a) => ({
    id: a.id,
    role: a.kind,
    sourceLocator: a.sourceLocator,
    rightsStatus: a.rightsStatus,
  })),
  verificationLimits: [
    'Publisher subscription full text not read; full author preprint and published supplementary evidence used',
    'No biological experiment or complete computational reproduction',
    'No human clinical efficacy inference',
  ],
  candidateStatus: {
    lc1: 'RESEARCH_PENDING_DEPTH_AND_MEDIA_RIGHTS',
    silicon: 'RESEARCH_PENDING_DEPTH; CC BY-NC-ND images not reused',
  },
  approval: {
    scope: 'User requested Sep 29 GitBlog and Blogger publication',
    notStandingAuthorization: true,
  },
});
const privateRoot = path.resolve(new URL(root).pathname, '../../../outputs/sep29-research');
if (fs.existsSync(path.join(privateRoot, 'sources/agent-preprint.pdf'))) {
  const sourceHashes = Object.fromEntries(
    ['agent-preprint.pdf', 'agent-si.pdf', 'autooed-ei.py', 'autooed-gp.py'].map((p) => [
      p,
      hash(fs.readFileSync(path.join(privateRoot, 'sources', p))),
    ])
  );
  fs.writeFileSync(
    path.join(privateRoot, 'source-hashes.json'),
    JSON.stringify(sourceHashes, null, 2) + '\n'
  );
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(path.join(privateRoot, 'graph.sqlite'));
  db.exec(
    'CREATE TABLE IF NOT EXISTS nodes(id TEXT PRIMARY KEY,json TEXT); CREATE TABLE IF NOT EXISTS edges(id TEXT PRIMARY KEY,json TEXT)'
  );
  // This article-specific generated projection is rebuilt from the inspected records.
  db.exec('DELETE FROM nodes; DELETE FROM edges');
  const n = db.prepare('INSERT OR REPLACE INTO nodes VALUES (?,?)');
  for (const item of nodes) n.run(item.id, JSON.stringify(item));
  const e = db.prepare('INSERT OR REPLACE INTO edges VALUES (?,?)');
  for (const item of edges) e.run(`${item.from}:${item.relation}:${item.to}`, JSON.stringify(item));
  db.close();
}
console.log(
  JSON.stringify({
    bodyCharacters: body.length,
    images: assets.length,
    sourceSha256: hash(source),
    equations: cards.length,
  })
);
