import assert from 'node:assert/strict';
import fs from 'node:fs';

const header = fs.readFileSync(new URL('../src/components/Header.astro', import.meta.url), 'utf8');
const languageHint = fs.readFileSync(new URL('../src/components/LanguageHint.astro', import.meta.url), 'utf8');
const layout = fs.readFileSync(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');
const postPage = fs.readFileSync(
  new URL('../src/pages/posts/[...slug]/index.astro', import.meta.url),
  'utf8'
);

for (const [name, source] of [
  ['Header.astro', header],
  ['Layout.astro', layout],
  ['LanguageHint.astro', languageHint],
  ['post page', postPage],
]) {
  assert(
    !source.includes('translate.google.com'),
    `${name}: external Google Translate proxy is forbidden`
  );
  assert(
    !source.includes('data-language-english'),
    `${name}: legacy translation redirect is forbidden`
  );
}

assert(
  header.includes('englishPath?: string'),
  'Header must accept an explicit native English path'
);
assert(
  header.includes('href={englishPath}'),
  'Header EN control must link to a native English page'
);
assert(header.includes('hreflang="en"'), 'Header EN control must declare its language');
assert(
  layout.includes('const englishPath = languageAlternates.en'),
  'Layout must prefer actual translations for language navigation'
);
assert(
  postPage.includes('post.data.translatedPosts'),
  'Post pages must expose only declared native translations'
);

assert(!header.includes('/en/translations/?from='),
  'The header must keep the current reading context');
assert(languageHint.includes('href={englishPath}'), 'The hint must use the same destination as the header');
console.log('language-routing-contract: PASS native language navigation');
