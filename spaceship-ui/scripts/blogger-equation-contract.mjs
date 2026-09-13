import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const source = path.join(root, 'ops/blog-harness/blogger/2026-09-09-navier-stokes-easy.md');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'jjo-blogger-equation-'));
const output = path.join(temporary, 'navier-stokes.html');

try {
  const result = spawnSync(
    process.execPath,
    ['scripts/render-blogger-post.mjs', source, output, '--min-images', '2'],
    { cwd: root, encoding: 'utf8' }
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const html = fs.readFileSync(output, 'utf8');
  assert.match(html, /Blogger equation cards: 1/);
  assert.match(html, /data-blogger-equation="navier-stokes"/);
  assert.match(html, /∂u\/∂t/);
  assert.match(html, /νΔu/);
  assert.match(html, /ν는 그리스 문자 뉴/);
  assert.doesNotMatch(html, /navier-equation-map-v2\.svg/);
  assert.doesNotMatch(html, /(?:\$\$|\\\[|\\begin\{|\\frac\{)/);

  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    assert.match(image[0], /width:100%;max-width:100%;height:auto/);
  }
  console.log('Blogger equation contract passed.');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
