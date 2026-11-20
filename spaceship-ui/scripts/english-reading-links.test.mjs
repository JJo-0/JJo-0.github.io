import assert from 'node:assert/strict';
import { localizeReadingLinks } from '../src/lib/english-reading-links.mjs';

const source = new URL('https://jjo-0.github.io/posts/start/');
const map = new Map([['/posts/target/', '/en/posts/translated/']]);
const render = html => localizeReadingLinks(html, source, path => map.get(path));
const original = '<a class="article" href="/posts/target/?a=1&amp;b=2#section">Read next</a>';
const target = '<a class="article" href="/en/posts/translated/?a=1&amp;b=2#section">Read next</a>';
assert.equal(render(original), target);
for (const href of ['../target/', '/posts/target/', 'https://jjo-0.github.io/posts/target/']) {
  assert.equal(render(`<a href="${href}">Read</a>`), '<a href="/en/posts/translated/">Read</a>');
}
const untouched = [
  '<!-- <a href="/posts/target/"> -->',
  '<code>&lt;a href="/posts/target/"&gt;</code>',
  '<script type="application/json">{"markup":"<a href=\'/posts/target/\'>"}</script>',
  '<astro-island props="{&quot;href&quot;:&quot;/posts/target/&quot;}"></astro-island>',
  '<a href="#note-1" data-news-citation="1">1</a>',
  '<a href="/posts/target/" hreflang="ko-KR">Original</a>',
  '<a href="/posts/target/">Introduction, currently in Korean</a>',
  '<a href="/posts/unknown/">Unpublished</a>',
  '<a href="https://example.org/posts/target/">External</a>',
  '<figure><figcaption><a href="/posts/target/">Source</a></figcaption></figure>',
  '<li data-news-reference="1"><a href="/posts/target/">Reference</a></li>',
  '<img src="/posts/target/" alt="Manuscript">',
].join('\n');
assert.equal(render(untouched + original + untouched), untouched + target + untouched);
console.log('english-reading-links: PASS internal reading links, native anchors, sources and untouched surrounding markup');
