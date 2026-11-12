import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const slug = 'segmentation-from-pixels-to-robot-observations';
const post = fs.readFileSync(`site/content/posts/${slug}.mdx`, 'utf8');
const rl = fs.readFileSync('site/content/posts/rl-robot-learning-ch01-introduction.mdx', 'utf8');
const modern = fs.readFileSync('site/content/posts/modern-artificial-intelligence-6.mdx', 'utf8');
assert(rl.includes(`[영상 속 물체를 픽셀 단위로 구분하는 모델](/posts/${slug}/)`));
assert(modern.includes(`/posts/${slug}/`));
assert(post.includes('/posts/rl-robot-learning-ch01-introduction/'));
assert(post.includes('/posts/2026-08-25-modern-artificial-intelligence-6/'));
assert([...post].every(char => char.charCodeAt(0) >= 32 || ['\n', '\r', '\t'].includes(char)));
const images = [...post.matchAll(/!\[([^\]]+)\]\(([^)]+)\)/g)];
assert.equal(images.length, 2);
for (const [, alt, url] of images) {
  assert(alt.length > 15);
  assert(fs.existsSync(path.join('site/assets', url)));
}
const slideBlocks = [...post.matchAll(/<SegmentationLectureSlide page=\{(\d+)\}[^>]*\/>\s*([^#]+?)(?=\n## |$)/g)];
const pages = slideBlocks.map(m => Number(m[1]));
assert.deepEqual(pages, Array.from({length:33}, (_,i) => i+32));
for (const block of slideBlocks) {
  assert(block[2].trim().length > 150, `Missing substantive commentary for page ${block[1]}`);
  const file = `site/assets/assets/posts/${slug}/slides/slide-${block[1].padStart(3,'0')}.webp`;
  assert(fs.existsSync(file));
}
assert(post.includes('2025년 영상'));
assert(post.includes('자막 전문 미확보'));
assert(post.includes('발표용 스크립트'));
const prediction = new Set([0,1,2,3,4,5,6,7,8]);
const groundTruth = new Set([3,4,5,6,7,8,9,10,11]);
const intersection = [...prediction].filter(x => groundTruth.has(x)).length;
const union = new Set([...prediction, ...groundTruth]).size;
assert.equal(intersection / union, 0.5);
console.log('segmentation-intro-audit: PASS (links, 33 source slides with individual commentary, 2 original supplemental assets, version/transcript disclosure, IoU example)');
// Run after build to catch canonical routes that include historical date prefixes.
if (fs.existsSync('dist')) {
  for (const [, route] of post.matchAll(/\]\((\/posts\/[^)#]+)(?:#[^)]+)?\)/g)) {
    assert(fs.existsSync(path.join('dist', route, 'index.html')), `Missing rendered route: ${route}`);
  }
  console.log('segmentation-intro-audit: canonical internal routes exist in dist');
}
