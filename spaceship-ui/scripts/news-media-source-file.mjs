const safeRouteSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
