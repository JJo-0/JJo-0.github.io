// Fold only a named NEWS source section with registered references. Preserve
// every original node and anchor; evidence/limitations in the body stay visible.
function text(node) {
  return node.type === 'text' ? node.value : (node.children ?? []).map(text).join('');
}
function references(node, ids = new Set()) {
  if (node.type === 'element' && node.properties?.dataNewsReference) ids.add(String(node.properties.dataNewsReference));
  if (node.type === 'element' && node.properties?.['data-news-reference']) ids.add(String(node.properties['data-news-reference']));
  for (const attribute of node.attributes ?? []) {
    if (attribute.name === 'data-news-reference' && typeof attribute.value === 'string') ids.add(attribute.value);
  }
  for (const child of node.children ?? []) references(child, ids);
  return ids;
}
const titles = new Set(['출처·도판 권리와 열람 범위', '출처와 열람 범위', '원문·그림·수식의 출처', '원문·그림 사용 범위']);
export default function newsSourceDisclosure() {
  return tree => {
    function transform(parent) {
      if (!parent.children || parent.tagName === 'details' || parent.name === 'details') return;
      for (let i = 0; i < parent.children.length; i++) {
        const heading = parent.children[i];
        if (heading.type === 'element' && /^h[23]$/.test(heading.tagName) && titles.has(text(heading).trim())) {
          let end = i + 1;
          // Related lower-level audit headings belong in the same disclosure.
          while (end < parent.children.length && !(parent.children[end].type === 'element' && /^h[12]$/.test(parent.children[end].tagName))) end++;
          const original = parent.children.slice(i, end);
          const ids = references({children: original});
          if (ids.size) {
            parent.children.splice(i, end - i, {type: 'element', tagName: 'details', properties: {className: ['news-source-disclosure'], 'data-news-source-disclosure': true}, children: [
              {type: 'element', tagName: 'summary', properties: {}, children: [{type: 'text', value: `출처·도판 권리·열람 범위 (${ids.size})`}]},
              {type: 'element', tagName: 'div', properties: {className: ['news-source-disclosure__body']}, children: original},
            ]});
            continue;
          }
        }
        transform(parent.children[i]);
      }
    }
    transform(tree);
  };
}
