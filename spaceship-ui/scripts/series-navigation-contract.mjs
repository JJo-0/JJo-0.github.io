import fs from 'node:fs';
import assert from 'node:assert/strict';
import { parse } from 'parse5';
const read = path => fs.readFileSync(path, 'utf8');
const nodes = root => [root, ...(root.childNodes || []).flatMap(nodes)];
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
for (const route of ['bible', 'posts']) {
  const tree = nodes(parse(read(`dist/${route}/index.html`)));
  for (const [id, count] of Object.entries({ overview: 3, 'acts-1-1-14': 6, 'acts-2-14-37': 3, 'ezekiel-2-1-3-11': 3, ...(route === 'posts' ? { 'modern-artificial-intelligence': 8, 'ai-consciousness-deep-research': 3, 'data-structures-coding-tests': 7, supplements: 3 } : {}) })) {
    const group = tree.find(n => attr(n, 'data-series-group') === id);
    assert(group && group.tagName === 'details', `Missing accessible details group ${id} at ${route}`);
    assert(!group.attrs.some(a => a.name === 'open'), `Group must start collapsed: ${id}`);
    assert.equal(nodes(group).filter(n => n.tagName === 'article').length, count, `${id} member count`);
    assert(group.childNodes.some(n => n.tagName === 'summary'));
  }
  assert.equal(tree.filter(n => n.attrs?.some(a => a.name === 'data-acts-card')).length, 9);
  assert(read(`dist/${route}/index.html`).includes('1:15–26') && read(`dist/${route}/index.html`).includes('2:1–13'));
}
for (const [kind, range, source] of [['acts', '2-14-37', '224428120204'], ['ezekiel', '2-1-3-11', '224428051487']]) {
  for (let i = 1; i <= 3; i++) {
    const html = read(`dist/posts/${kind}-${range}-${i}/index.html`);
    assert(html.includes(`data-bible-source-guide="${kind}"`));
    assert(html.includes(`https://blog.naver.com/jjo_09_/${source}`));
    assert(html.includes('data-dashboard-pending'));
    assert(!html.includes(`data-${kind}-report=`));
    assert(!html.includes('bible-references') && !html.includes('data-acts-dashboard'));
  }
}
const index = read('dist/api/search.json');
for (const slug of ['deep-search-gemini', 'deep-search-travel-prompt']) {
  assert(!fs.existsSync(`site/content/posts/${slug}.md`));
  assert(!index.includes(`2025-05-23-${slug}`));
  assert(read(`dist/posts/2025-05-23-${slug}/index.html`).includes(`data-retired-post="${slug}"`));
}
console.log('series-navigation-contract: PASS collapsed groups, preserved Bible routes, Naver source guides, retired posts absent from public collection');
