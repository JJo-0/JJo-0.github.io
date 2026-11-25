import katex from 'katex';

// Bounded build-process memoization. Never changes the formula's HTML/MathML.
export function createMathRenderer(render = (tex, options) => katex.renderToString(tex, options), maxEntries = 512, maxUnits = 4 * 1024 * 1024) {
  const cache = new Map();
  let units = 0;
  return function renderMath(tex, displayMode, strictMode = false) {
    const key = JSON.stringify([tex, displayMode, strictMode]);
    if (cache.has(key)) {
      const previous = cache.get(key);
      cache.delete(key);
      cache.set(key, previous);
      return previous;
    }
    const html = render(tex, {
      displayMode, throwOnError: strictMode, strict: strictMode ? 'error' : 'warn',
      trust: false, output: 'htmlAndMathml',
    });
    // Error output must not be memoized. Limit entries and string units.
    const size = key.length + html.length;
    if (html.includes('katex-error') || size > maxUnits || maxEntries < 1) return html;
    while (cache.size >= maxEntries || units + size > maxUnits) {
      const oldest = cache.keys().next().value;
      if (oldest === undefined) break;
      units -= oldest.length + cache.get(oldest).length;
      cache.delete(oldest);
    }
    cache.set(key, html);
    units += size;
    return html;
  };
}
export const renderMath = createMathRenderer();
