import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import katex from 'katex';

const root = process.cwd();
const articlePath = path.join(root, 'site/content/posts/modern-artificial-intelligence-6.mdx');
const source = fs.readFileSync(articlePath, 'utf8');
const mediaRoot = path.join(root, 'site/assets/assets/posts/modern-ai-vi-papers');
const provenance = JSON.parse(fs.readFileSync(path.join(mediaRoot, 'provenance.json'), 'utf8'));
const ids = ['fcn-fig-2', 'fcn-fig-3', 'fcn-fig-4', 'unet-fig-1', 'unet-fig-3'];
const pdfHashes = {
  '1411.4038v2': 'a81b80808c2b9342fd2a3d9d0373db5aa81d83bd05c32cbb8cc7cc5596530d35',
  '1505.04597v1': 'a3172b2124f38e260dc2c7ed968d87c31bc94dbc19a42a7ab3dcbd7534319c44',
};
const shapeTrace = [];
const encoder = [];
let size = 572;
for (let level = 0; level < 4; level++) {
  const after = size - 4;
  shapeTrace.push([size, size - 2, after, after / 2]);
  encoder.push(after);
  size = after / 2;
}
shapeTrace.push([size, size - 2, size - 4]);
size -= 4;
const crops = [];
for (const skip of encoder.reverse()) {
  const up = size * 2;
  crops.push((skip - up) / 2);
  shapeTrace.push([up, up - 2, up - 4]);
  size = up - 4;
}
assert.equal(size, 388);
assert.deepEqual(crops, [4, 16, 40, 88]);
assert.equal((572 - size) / 2, 92);
assert.equal(572 - size, 184);

// Independently compute the toy dense-to-convolution example in the prose.
const x = [[1, 2, 4], [3, 5, 8], [6, 9, 13]];
const w = [[1, 0], [0, -1]];
const conv = [0, 1].map(i => [0, 1].map(j => w.reduce((sum, row, u) =>
  sum + row.reduce((subtotal, value, v) => subtotal + value * x[i + u][j + v], 0), 0)));
assert.deepEqual(conv, [[-4, -6], [-6, -8]]);
const c = [[1, 2, 0], [0, 1, 2]];
const input = [1, 2, 3];
const forward = c.map(row => row.reduce((sum, weight, index) => sum + weight * input[index], 0));
const transpose = input.map((_, j) => c.reduce((sum, row, i) => sum + row[j] * forward[i], 0));
assert.deepEqual(forward, [5, 8]);
assert.deepEqual(transpose, [5, 18, 16]);
assert.notDeepEqual(transpose, input);

const boundaryWeight = (d1, d2) => 1 + 10 * Math.exp(-((d1 + d2) ** 2) / (2 * 5 ** 2));
const near = boundaryWeight(1, 1), far = boundaryWeight(1, 9);
const loss = (z, weight) => weight * Math.log1p(Math.exp(-z));
for (const weight of [near, far]) {
  const h = 1e-5;
  const numerical = (loss(h, weight) - loss(-h, weight)) / (2 * h);
  assert(Math.abs(numerical - weight * (0.5 - 1)) < 1e-7, 'Weighted NLL gradient');
}
assert(-Math.log(0.9) < -Math.log(0.1));
assert(Math.log(0.9) > Math.log(0.1));

function checkArticle(text) {
  assert.deepEqual([...text.matchAll(/<SegmentationPaperFigure figure="([^"]+)"/g)].map(m => m[1]), ids);
  assert.deepEqual([...text.matchAll(/^## 6\.(\d) /gm)].map(m => Number(m[1])), [1, 2, 3, 4, 5, 6, 7, 8]);
  for (let i = 1; i <= 10; i++) {
    const id = `MAI-P6-${String(i).padStart(3, '0')}`;
    assert.equal(text.split(`modernAiFormula(6, '${id}')`).length - 1, 1, `Preserve ${id}`);
  }
  const table = text.split('| 위치 | 공간 크기의 변화 |')[1]?.split('\n\n')[0];
  assert(table, 'Original U-Net shape table missing');
  const rows = table.split('\n').filter(row => /^\| (encoder|bottleneck|decoder)/.test(row));
  assert.deepEqual(rows.map(row => [...row.split('|')[2].matchAll(/\d+/g)].map(m => Number(m[0]))), shapeTrace);
  for (const token of ['[[-4, -6], [-6, -8]]', near.toFixed(4), far.toFixed(4), '4·16·40·88', '92', '184', '원문 식 (1)', '원문 식 (2)', '해설용', '2015년 U-Net이 Dice loss로 학습했다고 해석하면 안 된다']) assert(text.includes(token), `Missing numerical/source distinction: ${token}`);
  const formulas = [...text.matchAll(/<Math display tex=\{String\.raw`([^`]+)`\}/g)].map(m => m[1]);
  const required = [
    String.raw`E=\sum_{x\in\Omega}w(x)\log p_{\ell(x)}(x)`,
    String.raw`\mathcal L_{\mathrm{NLL}}=-E=-\sum_{x\in\Omega}w(x)\log p_{\ell(x)}(x)`,
    String.raw`(d_1(x)+d_2(x))^2`,
    String.raw`\frac{\partial\mathcal L_x}{\partial a_k(x)}=w(x)\bigl(p_k(x)-y_k(x)\bigr)`,
    String.raw`Z_{16}=\operatorname{Align}(U_2(Z_{32}),S_4)+S_4`,
    String.raw`\operatorname{Concat}_{\mathrm{channel}}`,
  ];
  for (const expression of required) assert(formulas.some(tex => tex.includes(expression)), `Missing/corrupt equation: ${expression}`);
  for (const tex of formulas) katex.renderToString(tex, { displayMode: true, throwOnError: true, strict: 'error', trust: false });
  for (const paper of Object.keys(pdfHashes)) assert(text.includes(`https://arxiv.org/html/${paper}`));
  assert(!/<img\b[^>]+src="https?:/i.test(text), 'No remote image hotlinks');
  return formulas.length;
}
const equationCount = checkArticle(source);
const controls = [
  ['wrong output geometry', s => s.replace('572 → 570 → 568 → pooling 284', '574 → 572 → 570 → pooling 285')],
  ['wrong boundary distance', s => s.replace('(d_1(x)+d_2(x))^2', '(d_1(x)-d_2(x))^2')],
  ['negative loss sign lost', s => s.replace('NLL}}=-E=-', 'NLL}}=E=')],
  ['original sign silently rewritten', s => s.replace('`E=\\sum', '`E=-\\sum')],
  ['figure omitted', s => s.replace('figure="unet-fig-3"', 'figure="unet-fig-99"')],
  ['FCN sum replaced', s => s.replace('),S_4)+S_4', '),S_4)-S_4')],
];
for (const [label, mutate] of controls) {
  const mutant = mutate(source);
  assert.notEqual(mutant, source, `Control did not mutate source: ${label}`);
  assert.throws(() => checkArticle(mutant), undefined, `Failed to reject: ${label}`);
}
assert.deepEqual(provenance.figures.map(row => row.id), ids);
for (const row of provenance.figures) {
  assert.equal(row.pdfSha256, pdfHashes[row.version], 'Exact paper version');
  const bytes = fs.readFileSync(path.join(mediaRoot, row.file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), row.sha256, row.id);
  assert.equal(bytes.subarray(0, 4).toString(), 'RIFF');
  assert.equal(bytes.subarray(8, 12).toString(), 'WEBP');
  assert(row.width > 300 && row.height > 200 && row.cropPoints.length === 4);
  assert(row.rights.includes('No express republication permission is claimed'));
}
const rendered = path.join(root, 'dist/posts/2026-08-25-modern-artificial-intelligence-6/index.html');
if (fs.existsSync(rendered)) {
  const html = fs.readFileSync(rendered, 'utf8');
  assert.deepEqual([...html.matchAll(/data-paper-figure="([^"]+)"/g)].map(m => m[1]), ids);
  assert.equal([...html.matchAll(/data-formula-id="MAI-P6-\d{3}"/g)].length, 10);
  assert(!html.includes('katex-error'), 'Rendered equation parse failure');
  for (const heading of ['완전연결층을 합성곱으로', '572×572는 왜 388×388', '공간 가중 교차엔트로피', 'overlap-tile과 mirror context']) assert(html.includes(heading), heading);
}
console.log(`modern-ai-vi-papers: PASS 5 original figure excerpts, 10 preserved source equations, ${equationCount} additional equations, numerical shape/weight/gradient examples, ${controls.length} mutation controls. Not a complete review of all Part VI topics or reuse permission.`);
