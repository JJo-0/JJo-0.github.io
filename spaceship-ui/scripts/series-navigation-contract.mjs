import fs from 'node:fs';
import assert from 'node:assert/strict';
import { parse } from 'parse5';
const read = path => fs.readFileSync(path, 'utf8');
const nodes = root => [root, ...(root.childNodes || []).flatMap(nodes)];
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
for (const route of ['bible', 'posts']) {
  const tree = nodes(parse(read(`dist/${route}/index.html`)));
  for (const [id, count] of Object.entries({ overview: 3, 'acts-1-1-14': 6, 'acts-2-14-37': 3, 'ezekiel-2-1-3-11': 3, ...(route === 'posts' ? { 'modern-artificial-intelligence': 8, 'ai-consciousness-deep-research': 3, 'human-motion-study': 1, 'data-structures-coding-tests': 7, supplements: 3 } : {}) })) {
    const group = tree.find(n => attr(n, 'data-series-group') === id);
    assert(group && group.tagName === 'details', `Missing accessible details group ${id} at ${route}`);
    assert(!group.attrs.some(a => a.name === 'open'), `Group must start collapsed: ${id}`);
    assert.equal(nodes(group).filter(n => n.tagName === 'article').length, count, `${id} member count`);
    assert(group.childNodes.some(n => n.tagName === 'summary'));
    if (id === 'human-motion-study') {
      const category = tree.find(n => attr(n, 'id') === 'vision-perception-neuroscience');
      assert(category && nodes(category).includes(group), 'Motion study belongs in Vision');
      assert(nodes(group).some(n => attr(n, 'href')?.replace(/\/$/, '') === '/posts/human-motion-study-0'));
      assert(text(group).includes('0편'), 'The series starts with episode zero');
    }
    if (id === 'ezekiel-2-1-3-11') {
      const copy = text(group).replace(/\s+/g, ' ');
      assert(copy.includes('블로그 본문에서 읽는 전체 연구 · 세 연구 관점'));
      assert(copy.includes('Naver 원문과 대조하기'));
      assert(!copy.includes('Naver 완성 원문 · 세 연구 관점 안내'));
      const times = [...copy.matchAll(/(\d+) min read/g)].map(match => Number(match[1]));
      assert.equal(times.length, 3, `Expected three Ezekiel read-time estimates at ${route}`);
      assert(times.every(minutes => minutes >= 15), `Ezekiel full reports must not be advertised as short reads: ${times.join(', ')}`);
    }
  }
  assert.equal(tree.filter(n => n.attrs?.some(a => a.name === 'data-acts-card')).length, 9);
  assert(read(`dist/${route}/index.html`).includes('1:15–26') && read(`dist/${route}/index.html`).includes('2:1–13'));
}

// Acts 2:14–37 still intentionally exposes only the verified source guide.
for (let i = 1; i <= 3; i++) {
  const html = read(`dist/posts/acts-2-14-37-${i}/index.html`);
  assert(html.includes('data-bible-source-guide="acts"'));
  assert(html.includes('https://blog.naver.com/jjo_09_/224428120204'));
  assert(html.includes('data-dashboard-pending'));
  assert(!html.includes('data-acts-report='));
  assert(!html.includes('bible-references') && !html.includes('data-acts-dashboard'));
}

// Ezekiel now renders the already-verified local report corpus directly in each article.
const imageDimensions = [
  ['01-babylon-lion-met-31-13-2.jpg', '3811', '1656'],
  ['02-nebuchadnezzar-cylinder-met-86-11-60-original.jpg', '3895', '2318'],
  ['03-babylon-city-map-commons.png', '800', '694'],
];
for (let i = 1; i <= 3; i++) {
  const html = read(`dist/posts/ezekiel-2-1-3-11-${i}/index.html`);
  assert(html.includes('data-bible-source-guide="ezekiel"'));
  assert(html.includes(`data-ezekiel-report="${i}"`));
  assert(html.includes('data-ezekiel-research-body'));
  assert(html.includes('https://blog.naver.com/jjo_09_/224428051487'));
  assert(!html.includes('data-dashboard-pending'));
  assert(html.includes(`id="reference-ezekiel-${i}-1"`));
  assert(html.includes('bible-references'));
  assert(!html.includes('data-acts-dashboard'));
  if (i === 1 || i === 3) {
    const expected = i === 1 ? imageDimensions.slice(0, 2) : imageDimensions.slice(2);
    for (const [file, width, height] of expected) {
      assert(html.includes(`src="/assets/posts/ezekiel-2-1-3-11/${file}"`));
      const imagePattern = new RegExp(`<img[^>]+src="/assets/posts/ezekiel-2-1-3-11/${file.replaceAll('.', '\\.')}[^>]+width="${width}"[^>]+height="${height}"`);
      assert(imagePattern.test(html), `Missing intrinsic Ezekiel image dimensions: ${file}`);
    }
  }
}
const index = read('dist/api/search.json');
for (const slug of ['deep-search-gemini', 'deep-search-travel-prompt']) {
  assert(!fs.existsSync(`site/content/posts/${slug}.md`));
  assert(!index.includes(`2025-05-23-${slug}`));
  assert(read(`dist/posts/2025-05-23-${slug}/index.html`).includes(`data-retired-post="${slug}"`));
}
// Every rendered primary lecture slide has a matching heading and table-of-contents target.
const robotSlugs = fs.readdirSync('dist/posts').filter(slug => /^rl-robot-learning-ch\d{2}-/.test(slug)).sort();
assert.equal(robotSlugs.length, 11);
for (const [index, slug] of robotSlugs.entries()) {
  const tree = nodes(parse(read(`dist/posts/${slug}/index.html`)));
  const readingNavigation = tree.find(n => attr(n, 'data-series-reading-navigation') !== undefined);
  assert(readingNavigation, `Missing reading links at ${slug}`);
  const links = nodes(readingNavigation).filter(n => n.tagName === 'a');
  assert(links.some(n => attr(n, 'href') === '#main-content'));
  const previous = links.find(n => attr(n, 'rel') === 'prev');
  const next = links.find(n => attr(n, 'rel') === 'next');
  assert.equal(previous ? attr(previous, 'href') : undefined, index > 0 ? `/posts/${robotSlugs[index - 1]}/` : undefined);
  assert.equal(next ? attr(next, 'href') : undefined, index < 10 ? `/posts/${robotSlugs[index + 1]}/` : undefined);
  const toc = tree.find(n => n.tagName === 'nav' && attr(n, 'aria-label') === 'On this page');
  const headings = tree.filter(n => ['h2', 'h3'].includes(n.tagName) && /^#?\s*P\d{3} ·/.test(text(n).trim()));
  const slides = tree.filter(n => attr(n, 'data-lecture-slide'));
  assert.equal(headings.length, slides.length, `One heading per slide at ${slug}`);
  for (const slide of slides) {
    const page = attr(slide, 'data-lecture-slide');
    const heading = headings.find(n => text(n).includes(page + ' ·'));
    assert(heading && attr(heading, 'id'));
    assert(nodes(toc).some(n => attr(n, 'href') === '#' + attr(heading, 'id')), `Missing toc link for ${slug} ${page}`);
  }
}
const firstRobotPost = nodes(parse(read('dist/posts/rl-robot-learning-ch01-introduction/index.html')));
assert.equal(firstRobotPost.filter(n => attr(n, 'data-supplementary-figure') !== undefined).length, 5);
for (const filename of ['ucl-agent-components.png', 'ntu-actor-observation-action.png']) {
  const image = firstRobotPost.find(n => attr(n, 'src')?.endsWith(filename));
  assert(image && Number(attr(image, 'width')) > 0 && Number(attr(image, 'height')) > 0);
}

// Check published neighbours for every series, including episode zero and
// one-entry series. Drafts and future entries never become reading links.
const readingGroups = new Map();
for (const slug of fs.readdirSync('dist/posts')) {
  const file = `dist/posts/${slug}/index.html`;
  if (!fs.existsSync(file)) continue;
  const html = read(file);
  if (!html.includes('data-series-reading-navigation=')) continue;
  const tree = nodes(parse(html));
  const nav = tree.find(n => attr(n, 'data-series-reading-navigation') !== undefined);
  assert(nav && nav.tagName === 'nav');
  const id = attr(nav, 'data-series-reading-navigation');
  const entries = readingGroups.get(id) || [];
  entries.push({ slug, nav, order: Number(attr(nav, 'data-series-order')) });
  readingGroups.set(id, entries);
}
assert(readingGroups.size > 10, 'Reading links must cover other series too');
let readingPostCount = 0;
for (const [id, entries] of readingGroups) {
  entries.sort((a, b) => a.order - b.order);
  for (const [index, entry] of entries.entries()) {
    const links = nodes(entry.nav).filter(n => n.tagName === 'a');
    assert(links.some(n => attr(n, 'href') === '#main-content'));
    for (const [rel, neighbour] of [['prev', entries[index - 1]], ['next', entries[index + 1]]]) {
      const link = links.find(n => attr(n, 'rel') === rel);
      assert.equal(link ? attr(link, 'href') : undefined, neighbour ? `/posts/${neighbour.slug}/` : undefined, `${id} ${entry.slug} ${rel}`);
    }
    readingPostCount++;
  }
}
console.log(`series-reading: PASS ${readingGroups.size} series, ${readingPostCount} published posts`);
const goalTable = firstRobotPost.find(n => n.tagName === 'table' && text(n).includes('강의의 네 목표'));
assert(goalTable?.parentNode && attr(goalTable.parentNode, 'class') === 'table-scroll');
assert.equal(attr(goalTable.parentNode, 'tabindex'), '0');
assert.equal(attr(goalTable.parentNode, 'role'), 'region');
console.log('series-navigation-contract: PASS collapsed groups, Acts source guides, inline Ezekiel reports, full-report read times/image geometry, retired posts absent from public collection');
