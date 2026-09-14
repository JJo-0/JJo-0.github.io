import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const media = JSON.parse(fs.readFileSync(new URL('../site/news-media.json', import.meta.url), 'utf8'));

const cases = [
  {
    slug: '2026-09-14-fors-diffusion-sampling-news',
    ids: ['fors-accuracy-map', 'fors-oracle-map'],
    source: 'https://arxiv.org/abs/2602.01338',
    ledger: '../site/assets/assets/posts/fors-20260914/provenance.json',
    minProse: 6000,
  },
  {
    slug: '2026-09-14-d4rt-dynamic-4d-vision-news',
    ids: ['d4rt-video-query', 'd4rt-four-dimensions'],
    source: 'https://d4rt-paper.github.io/',
    ledger: '../site/assets/assets/posts/d4rt-20260914/provenance.json',
    minProse: 6000,
  },
];

for (const entry of cases) {
  const post = fs.readFileSync(new URL(`../site/content/posts/${entry.slug}.mdx`, import.meta.url), 'utf8');
  const frontmatter = post.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert(frontmatter, `${entry.slug}: frontmatter required`);
  assert.match(frontmatter[1], /^draft: false$/m, `${entry.slug}: explicit publication state required`);
  assert.match(frontmatter[1], new RegExp(`^slug: ${entry.slug}$`, 'm'));
  assert(post.includes('import NewsFigure'), `${entry.slug}: NewsFigure import required`);
  assert.equal((post.match(/<NewsFigure\b/g) ?? []).length, entry.ids.length, `${entry.slug}: exactly two reader-purpose visuals required`);

  const ids = Object.entries(media)
    .filter(([, item]) => item.slug === entry.slug)
    .map(([id]) => id);
  assert.deepEqual(ids, entry.ids, `${entry.slug}: catalogue order must match article visual order`);
  const ledger = JSON.parse(fs.readFileSync(new URL(entry.ledger, import.meta.url), 'utf8'));
  assert.equal(ledger.article, entry.slug, `${entry.slug}: provenance must name the correct article`);
  assert.match(ledger.policy, /not rehosted|instead of rehosting/i, `${entry.slug}: provenance must keep source-media boundary`);
  assert.deepEqual(ledger.assets.map((asset) => asset.media_id), entry.ids, `${entry.slug}: provenance coverage must equal rendered media`);

  for (const id of entry.ids) {
    const item = media[id];
    for (const field of ['src', 'alt', 'kind', 'caption', 'credit', 'source', 'license', 'rights', 'changes'])
      assert(typeof item[field] === 'string' && item[field].trim(), `${id}: missing ${field}`);
    assert(post.includes(`<NewsFigure media="${id}"`), `${entry.slug}: missing ${id}`);
    assert(item.src.startsWith('/assets/posts/'), `${id}: local reader asset required`);
    assert.equal(item.license, '자체 제작 · MIT', `${id}: only independently authored diagrams may be rehosted`);
    assert.equal(item.rights, 'https://github.com/JJo-0/JJo-0.github.io/blob/main/LICENSE', `${id}: own-rights link required`);
    const svg = fs.readFileSync(new URL(`../site/assets${item.src}`, import.meta.url), 'utf8');
    assert.match(svg, /<title\b/);
    assert.match(svg, /<desc\b/);
    assert.doesNotMatch(svg, /<script\b|<foreignObject\b|<!ENTITY|@font-face/i);
    assert.doesNotMatch(svg, /(?:href|xlink:href)=["'](?:https?:|data:)/i);
    const record = ledger.assets.find((asset) => asset.media_id === id);
    assert(record, `${id}: provenance row required`);
    assert.equal(createHash('sha256').update(svg).digest('hex'), record.sha256, `${id}: source SVG digest changed`);
  }

  assert(post.includes(entry.source), `${entry.slug}: primary source link required`);
  assert.match(post, /별도 자유 이용 허락을 확인하지 못/, `${entry.slug}: must explain why source figures are linked rather than copied`);
  const prose = post
    .slice(frontmatter[0].length)
    .replace(/^import .*;\s*$/gm, '')
    .replace(/<(?:Math|NewsFigure)\b[^>]*?\/>/gs, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[\d+\]/g, '')
    .replace(/^[#>\s]+/gm, '')
    .replace(/[*|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  assert(prose.length >= entry.minProse && prose.length <= 9000, `${entry.slug}: 6,000–9,000 Korean prose characters required; got ${prose.length}`);
}

console.log('news-20260914-candidates-visual-contract: PASS two candidate explainers with source links, rights boundaries, two own diagrams, and long reader prose');
