// GitHub Pages serves /404.html for missing paths; a nested /en/404/ route
// alone cannot localize that response. Preserve the status and requested URL.
function localizeEnglishNotFound() {
  if (!document.querySelector('[data-not-found-page]')) return;
  if (location.pathname !== '/en' && !location.pathname.startsWith('/en/')) return;
  document.documentElement.lang = 'en';
  document.documentElement.dataset.englishNotFound = 'true';
  document.querySelector('base')?.setAttribute('href', location.pathname);
  document.querySelector('[data-language-hint]')?.remove();
  const destinations = new Map([
    ['/', '/en/'], ['/research', '/en/research/'], ['/posts', '/en/posts/'],
    ['/news', '/en/news/'], ['/about', '/en/about/'],
  ]);
  for (const anchor of document.querySelectorAll('a[href]')) {
    const href = anchor.getAttribute('href');
    const translated = destinations.get(href);
    if (!translated) continue;
    anchor.setAttribute('href', translated);
    anchor.setAttribute('data-astro-reload', '');
    if (anchor.textContent.trim() === href) anchor.textContent = translated;
  }
  const switcher = document.querySelector('header [data-locale-choice]');
  if (switcher) {
    switcher.setAttribute('href', '/posts');
    switcher.setAttribute('data-locale-choice', 'ko');
    switcher.setAttribute('lang', 'ko');
    switcher.setAttribute('hreflang', 'ko-KR');
    switcher.setAttribute('aria-label', '한국어 글 목록으로 이동');
    switcher.setAttribute('title', '한국어 글 목록');
    switcher.setAttribute('data-astro-reload', '');
    switcher.textContent = 'KO';
  }
  const labels = new Map([
    ['/notices/2026-09-11-biblical-studies-and-policies', 'Editorial notice (Korean)'],
    ['/policies', 'Editorial and AI-use policy (Korean)'],
    ['/policies/disclaimer', 'Disclaimer (Korean)'],
    ['/policies/copyright', 'Copyright and reuse (Korean)'],
    ['/bible/reading-guide', 'Biblical studies reading guide (Korean)'],
  ]);
  for (const anchor of document.querySelectorAll('footer a[href]')) {
    const label = labels.get(anchor.getAttribute('href'));
    if (label) { anchor.textContent = label; anchor.setAttribute('data-astro-reload', ''); }
  }
  const policyNav = document.querySelector('footer nav[lang="ko"]');
  policyNav?.setAttribute('lang', 'en');
  policyNav?.setAttribute('aria-label', 'Policies and reading guides (Korean originals)');
  const skip = document.querySelector('body > a[href="#main-content"]');
  if (skip) skip.textContent = 'Skip to main content';
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', 'en_US');
}
if (typeof window !== 'undefined') {
  localizeEnglishNotFound();
  document.addEventListener('astro:page-load', localizeEnglishNotFound);
}
