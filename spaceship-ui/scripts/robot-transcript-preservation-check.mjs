import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

// Frozen paragraph/equation/source blocks from the reviewed main commit. This
// guards the user's request to add explanations without dropping prior work.
const audit = JSON.parse(fs.readFileSync('../docs/robot-learning/reviews/2026-11-09-preserved-content.json', 'utf8'));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
let preserved = 0;
for (const chapter of audit.chapters) {
  const source = fs.readFileSync('../' + chapter.file, 'utf8');
  const blocks = source.split('\n\n').filter(block => block.trim()).map(sha);
  let cursor = 0;
  for (const expected of chapter.preservedBlocks) {
    const found = blocks.indexOf(expected, cursor);
    assert(found >= 0, `Chapter ${chapter.chapter}: previous explanation, equation or citation block removed/reordered: ${expected}`);
    cursor = found + 1;
    preserved++;
  }
  assert(source.length >= chapter.minimumChars, `Chapter ${chapter.chapter}: transcript additions shortened`);
  const slides = [...source.matchAll(/<LectureSlide\b[^>]*?page=\{(\d+)\}/g)].map(match => Number(match[1]));
  assert.deepEqual(slides, chapter.slides, `Chapter ${chapter.chapter}: reviewed slide coverage changed`);
  assert.equal(new Set(slides).size, slides.length, 'No repeated slide identifiers');
  assert(slides.every((page, i) => i === 0 || page > slides[i - 1]), 'Slides follow the source order');
}
assert.equal(audit.chapters.length, 11);
console.log(`robot-transcript-preservation: PASS 11 chapters, ${preserved} existing content blocks retained in order`);
