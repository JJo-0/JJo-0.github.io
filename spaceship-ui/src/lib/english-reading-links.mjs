import { parseFragment } from 'parse5';

function anchorText(node) {
  return node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(anchorText).join('');
}

/** Change href values in authored prose without serializing the surrounding Markdown, MDX or islands. */
export function localizeReadingLinks(html, originalURL, destinationFor) {
  if (!html.includes('href=')) return html;
  const root = parseFragment(html, { sourceCodeLocationInfo: true });
  const changes = [];

  function collect(node) {
    // Captions and bibliographies identify sources, and code and templates can contain literal examples.
    if (['figcaption', 'cite', 'code', 'pre', 'template', 'script', 'style'].includes(node.tagName)) return;
    const attrs = node.attrs ?? [];
    if (attrs.some(({ name, value }) =>
      name === 'data-news-reference' || name === 'data-news-citation' ||
      (name === 'role' && ['doc-bibliography', 'doc-biblioentry', 'doc-biblioref'].includes(value))
    )) return;
    if (node.tagName === 'a') {
      const href = attrs.find(attr => attr.name === 'href')?.value;
      if (!href || href.startsWith('#') || href.startsWith('?') || !URL.canParse(href, originalURL)) return;
      const url = new URL(href, originalURL);
      if (url.origin !== originalURL.origin || url.username || url.password) return;
      const localized = destinationFor(url.pathname);
      if (!localized) return;
      const explicitlyOriginal = attrs.some(({ name, value }) =>
        name === 'download' || name === 'data-original-path' || name === 'data-locale-choice' ||
        (['lang', 'hreflang'].includes(name) && /^ko(?:-|$)/i.test(value))
      );
      const label = anchorText(node);
      if (explicitlyOriginal || /\b(?:in Korean|Korean original|original Korean)\b|한국어\s*원문/i.test(label)) return;
      const loc = node.sourceCodeLocation?.attrs?.href;
      if (loc) {
        const target = (localized + url.search + url.hash).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
        changes.push({ start: loc.startOffset, end: loc.endOffset, replacement: `href="${target}"` });
      }
      return;
    }
    for (const child of node.childNodes ?? []) collect(child);
  }

  collect(root);
  // Source offsets refer to the original HTML, even when the HTML parser reparents a node.
  changes.sort((a, b) => a.start - b.start);
  const parts = [];
  let offset = 0;
  for (const { start, end, replacement } of changes) {
    parts.push(html.slice(offset, start), replacement);
    offset = end;
  }
  return parts.join('') + html.slice(offset);
}
