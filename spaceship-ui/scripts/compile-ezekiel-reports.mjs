import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { parseFragment } from 'parse5';
const root = process.argv[2];
if (!root) throw new Error('Pass the local verified source bundle directory; raw page snapshots are not published.');
const manifest = JSON.parse(fs.readFileSync(`${root}/source_manifest.json`));
const hashes = JSON.parse(fs.readFileSync(`${root}/checksums.json`));
for (const [name, hash] of Object.entries(hashes)) assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root, name))).digest('hex'), hash);
const text = (n) => n.nodeName === '#text' ? n.value : (n.childNodes || []).map(text).join('');
const attr = (n, key) => n.attrs?.find(a => a.name === key)?.value || '';
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const cleanText = s => s.replaceAll('\u200b', '').replace(/\s+/g, ' ').trim();
fs.mkdirSync('src/data/ezekiel-reports', { recursive: true });
const audit = { sourceUrl: manifest.source_url, retrievedUtc: manifest.retrieved_utc, reports: [] };
const hash = s => createHash('sha256').update(s).digest('hex');
const find = (n, tag) => [...(n.tagName === tag ? [n] : []), ...(n.childNodes || []).flatMap(c => find(c, tag))];
for (const report of manifest.reports) {
  const number = report.report;
  const refs = JSON.parse(fs.readFileSync(path.join(root, report.citations)));
  assert.equal(refs.length, report.citation_links);
  let tables = 0;
  let headings = [];
  const render = (n, inTable = false) => {
    if (n.nodeName === '#text') return escape(n.value.replaceAll('\u200b', '')).replace(/\[(\d+)\]/g, (m, id) => refs.some(r => r.number === Number(id)) ? `<a href="#reference-ezekiel-${number}-${id}" aria-label="보고서 ${number} 출처 ${id}">${m}</a>` : m);
    if (['script', 'style', '#comment'].includes(n.nodeName)) return '';
    const value = cleanText(text(n));
    if (n.tagName === 'p') {
      if (!value || value === `보고서 ${number} 인용 출처`) return '';
      if (/^\[\d+\]/.test(value) && refs.some(r => value.startsWith(`[${r.number}]`) && value.includes(r.label))) return '';
      let joined = value;
      for (const defect of manifest.presentation_defects.filter(d => d.report === number)) {
        if (value === defect.observed_fragments[1]) return '';
        if (value === defect.observed_fragments[0]) joined = defect.joined_heading;
      }
      const classes = (node) => attr(node, 'class') + ' ' + (node.childNodes || []).map(classes).join(' ');
      const heading = /se-fs-fs24/.test(classes(n)) ? 'h2' : /se-fs-fs19/.test(classes(n)) ? 'h3' : null;
      if (heading && !inTable) { headings.push(joined); return `<${heading}>${escape(joined)}</${heading}>`; }
      return `<p>${(n.childNodes || []).map(c => render(c, inTable)).join('')}</p>`;
    }
    if (n.tagName === 'table') {
      const rows = (node) => [...(node.tagName === 'tr' ? [node] : []), ...(node.childNodes || []).flatMap(rows)];
      const columns = (rows(n)[0]?.childNodes || []).filter(c => ['td', 'th'].includes(c.tagName)).reduce((sum, c) => sum + Number(attr(c, 'colspan') || 1), 0);
      tables++; return `<div class="bible-table-scroll" tabindex="0" role="region" aria-label="보고서 ${number} 표 ${tables}"><table style="--bible-table-columns:${columns}">${(n.childNodes || []).map(c => render(c, true)).join('')}</table></div>`; }
    if (n.tagName === 'img') {
      const filename = (attr(n, 'data-lazy-src') || attr(n, 'src')).split('/').pop().split('?')[0].replaceAll('_', '-');
      assert(fs.existsSync(`site/assets/assets/posts/ezekiel-2-1-3-11/${filename}`), filename);
      return `<img src="/assets/posts/ezekiel-2-1-3-11/${escape(filename)}" alt="바빌론의 역사·문화 배경 자료" loading="lazy">`;
    }
    const children = (n.childNodes || []).map(c => render(c, inTable)).join('');
    if (n.tagName === 'a') {
      const href = attr(n, 'href');
      return /^https?:\/\//.test(href) ? `<a href="${escape(href)}" target="_blank" rel="noopener noreferrer">${children}</a>` : children;
    }
    if (['tbody', 'thead', 'tfoot', 'tr', 'td', 'th', 'b', 'strong', 'i', 'em', 'ul', 'ol', 'li', 'sup', 'sub'].includes(n.tagName)) {
      const spans = ['td', 'th'].includes(n.tagName) ? ['colspan', 'rowspan'].map(k => /^\d+$/.test(attr(n, k)) ? ` ${k}="${attr(n, k)}"` : '').join('') : '';
      const tag = n.tagName === 'td' && n.parentNode?.tagName === 'tr' && n.parentNode.parentNode?.childNodes.filter(c => c.tagName === 'tr')[0] === n.parentNode ? 'th' : n.tagName;
      return `<${tag}${spans}${tag === 'th' ? ' scope="col"' : ''}>${children}</${tag}>`;
    }
    if (n.tagName === 'br') return '<br>';
    if (n.tagName === 'hr') return '<hr>';
    return children;
  };
  const source = fs.readFileSync(path.join(root, report.html), 'utf8');
  const sourceTree = parseFragment(source);
  let html = render(sourceTree);
  assert.equal(tables, report.tables);
  html += `<section class="bible-references" aria-label="보고서 ${number} 인용 출처"><h2>인용 출처 · 보고서 ${number}</h2><ol>` + refs.map(r => `<li id="reference-ezekiel-${number}-${r.number}" value="${r.number}"><a href="${escape(r.url)}" target="_blank" rel="noopener noreferrer">${escape(r.label)}</a></li>`).join('') + '</ol></section>';
  html = html.replace(/[ \t]+$/gm, '');
  fs.writeFileSync(`src/data/ezekiel-reports/report-${number}.html`, html);
  const defects = manifest.presentation_defects.filter(d => d.report === number);
  const paragraphs = find(sourceTree, 'p').map(p => cleanText(text(p))).filter(p => p && p !== `보고서 ${number} 인용 출처` && !defects.some(d => d.observed_fragments.includes(p)) && !(/^\[\d+\]/.test(p) && refs.some(r => p.startsWith(`[${r.number}]`) && p.includes(r.label))));
  audit.reports.push({ report: number, sourceSha256: hashes[report.html], renderedSha256: hash(html), tables, referenceCount: refs.length, paragraphHashes: paragraphs.map(hash), tableHashes: find(sourceTree, 'table').map(t => hash(cleanText(text(t)))), joinedHeadings: defects.map(d => d.joined_heading), references: refs });
  console.log(`Ezekiel report ${number}: ${tables} tables, ${refs.length} bottom references; ${headings.length} headings`);
}

fs.writeFileSync('src/data/ezekiel-reports/audit-manifest.json', JSON.stringify(audit, null, 2) + '\n');
