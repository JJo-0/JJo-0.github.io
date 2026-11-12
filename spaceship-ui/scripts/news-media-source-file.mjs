const safeRouteSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Separate explicitly approved body plates from a retained listing thumbnail. */
export function newsBodyMediaIds(item, sourceText) {
  if (!item.bodyMediaIds) return item.mediaIds;
  newsSourceIdentity(item, sourceText);
  const ids = item.bodyMediaIds;
  if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length
      || ids.some(id => !item.mediaIds?.includes(id)))
    throw new Error('Body media inventory must be a nonempty unique subset of declared media');
  const actual = [...sourceText.matchAll(/<NewsFigure\b([^>]*?)\/>/g)].map(match => {
    const id = match[1].match(/\bmedia="([^"]+)"/);
    if (!id) throw new Error('Body media must have static media IDs');
    return id[1];
  });
  if (JSON.stringify(ids) !== JSON.stringify(actual))
    throw new Error('Approved body media inventory differs from the actual article');
  return ids;
}

/** Resolve only a basename; article slugs are public routes, not source paths. */
export function newsSourceFilename(item) {
  if (!item || typeof item.slug !== 'string' || !safeRouteSlug.test(item.slug)) {
    throw new TypeError('News media item requires a path-safe public slug');
  }

  const filename = item.sourceFile ?? `${item.slug}.mdx`;
  if (typeof filename !== 'string' || !filename || filename !== filename.split(/[\\/]/).at(-1)
      || filename === '.' || filename === '..' || !filename.endsWith('.mdx')) {
    throw new TypeError(`News sourceFile must be an .mdx basename: ${String(filename)}`);
  }
  return filename;
}

/** Return the route slug established by the source frontmatter or legacy filename. */
export function newsSourceIdentity(item, sourceText) {
  const sourceFile = newsSourceFilename(item);
  if (typeof sourceText !== 'string') throw new TypeError('News source text is required');
  const frontmatter = sourceText.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) throw new Error(`${sourceFile}: missing source frontmatter`);

  const slugLines = frontmatter[1].split(/\r?\n/).filter(line => /^slug\s*:/.test(line));
  if (slugLines.length > 1) throw new Error(`${sourceFile}: duplicate source slug fields`);
  let effectiveSlug = sourceFile.slice(0, -'.mdx'.length);
  if (slugLines.length === 1) {
    const match = slugLines[0].match(/^slug\s*:\s*(?:"([^"\r\n]*)"|'([^'\r\n]*)'|([^#\s]+))\s*(?:#.*)?$/);
    if (!match) throw new Error(`${sourceFile}: source slug must be a static scalar`);
    effectiveSlug = match[1] ?? match[2] ?? match[3];
  }
  if (effectiveSlug !== item.slug) {
    throw new Error(`${sourceFile}: effective source slug ${effectiveSlug} does not match public slug ${item.slug}`);
  }
  return { sourceFile, effectiveSlug };
}
