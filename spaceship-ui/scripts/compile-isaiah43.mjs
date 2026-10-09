import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { parseFragment } from 'parse5';
const input = process.argv[2];
if (!input) throw new Error('Pass the verified private full-reports JSON path. It is not published.');
const root = 'src/data/isaiah43';
const asset = 'site/assets/assets/interactive/isaiah43';
const hash = s => createHash('sha256').update(s).digest('hex');
const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const attr = (n, k) => n.attrs?.find(a => a.name === k)?.value || '';
const skip = n => ['script', 'style', '#comment', 'sources-carousel-inline'].includes(n.nodeName);
const text = n => skip(n) ? '' : n.nodeName === '#text' ? n.value : (n.childNodes || []).map(text).join('');
const bundle = fs.readFileSync(input);
const reports = JSON.parse(bundle).reports;
const manifest = { fullReportsBytes: bundle.length, fullReportsSha256: hash(bundle), reports: [] };
fs.mkdirSync(`${root}/reports`, { recursive: true });
fs.mkdirSync(asset, { recursive: true });
fs.mkdirSync('/tmp/isaiah-compile', { recursive: true });
for (const report of reports) {
 const i = report.number;
 const raw = fs.readFileSync(`${root}/originals/dashboard-${i}.txt`);
 let dashboard = raw.toString('utf8');
 if (i !== 2) dashboard = dashboard.replace(/\\([<:@`.-])/g, '$1').replaceAll('&#x20;', ' ');
 else { assert.equal(dashboard.split('slate-navy:').length, 2); dashboard = dashboard.replace('slate-navy:', "'slate-navy':"); }
 const scripts = [...dashboard.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
 for (const script of scripts) new vm.Script(script);
 fs.writeFileSync(`${root}/dashboards/${i}.html`, dashboard);
 const sandbox = { tailwind: {} };
 const configScript = scripts.find(s => /^\s*tailwind\.config\s*=/.test(s));
 if (configScript) vm.runInNewContext(configScript, sandbox, { timeout: 100 });
 const config = { ...sandbox.tailwind.config, content: [{ raw: dashboard, extension: 'html' }] };
 fs.writeFileSync(`/tmp/isaiah-compile/${i}.cjs`, `module.exports=${JSON.stringify(config)}`);
 fs.writeFileSync('/tmp/isaiah-compile/input.css', '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
 execFileSync('npm', ['exec', '--cache', '/tmp/isaiah-npm', '--yes', '--package=tailwindcss@3.4.17', '--', 'tailwindcss', '-c', `/tmp/isaiah-compile/${i}.cjs`, '-i', '/tmp/isaiah-compile/input.css', '-o', `${asset}/${i}.css`, '--minify'], { stdio: 'inherit' });
 const tree = parseFragment(report.html);
 let tables = 0, citations = 0;
 const render = n => {
  if (skip(n)) return '';
  if (n.nodeName === '#text') return escape(n.value).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  if (n.tagName === 'sup' && attr(n, 'data-turn-source-index')) {
   const id = Number(attr(n, 'data-turn-source-index'));
   assert(report.sources[id - 1], `Missing citation ${i}:${id}`); citations++;
   return `<sup><a href="#reference-isaiah-${i}-${id}" aria-label="연구 ${i} 출처 ${id}">[${id}]</a></sup>`;
  }
  const children = (n.childNodes || []).map(render).join('');
  if (n.tagName === 'table') { tables++; return `<div class="bible-table-scroll" tabindex="0" role="region" aria-label="연구 ${i} 표 ${tables}"><table>${children}</table></div>`; }
  if (n.tagName === 'a') { const href = attr(n, 'href'); return /^https?:\/\//.test(href) && !href.includes('gemini.google.com/app/') ? `<a href="${escape(href)}" target="_blank" rel="noopener noreferrer">${children}</a>` : children; }
  if (['h1','h2','h3','h4','p','ul','ol','li','b','strong','i','em','u','s','sup','sub','code','pre','blockquote','thead','tbody','tfoot','tr','td','th'].includes(n.tagName)) {
   const tag = n.tagName === 'h1' ? 'h2' : n.tagName;
   const spans = ['td','th'].includes(tag) ? ['colspan','rowspan'].map(k => /^\d+$/.test(attr(n,k)) ? ` ${k}="${attr(n,k)}"` : '').join('') : '';
   return `<${tag}${spans}>${children}</${tag}>`;
  }
  if (n.tagName === 'br' || n.tagName === 'hr') return `<${n.tagName}>`;
  return children;
 };
 const body = render(tree);
 // Citation labels are additions; every original non-UI text character must survive.
 const cleaned = parseFragment(body);
 function withoutCitations(n) { if(n.tagName === 'sup' && n.childNodes?.some(c=>c.tagName==='a')) return ''; return n.nodeName==='#text'? n.value : (n.childNodes||[]).map(withoutCitations).join(''); }
 assert.equal(withoutCitations(cleaned), text(tree).replace(/\*\*([^*]+)\*\*/g, '$1'));
 const references = `<section class="bible-references"><h2>인용 출처</h2><ol>${report.sources.map((s,j)=>`<li id="reference-isaiah-${i}-${j+1}"><a href="${escape(s.href)}" target="_blank" rel="noopener noreferrer">${escape(s.text.replace(/\n새 창에서 열기$/, ''))}</a></li>`).join('')}</ol></section>`;
 assert(!body.includes('gemini.google.com/app/'));
 fs.writeFileSync(`${root}/reports/${i}.html`, body + references);
 const record = { number:i, title:report.title, rawBytes:raw.length, rawSha256:hash(raw), dashboardSha256:hash(dashboard), cssSha256:hash(fs.readFileSync(`${asset}/${i}.css`)), sourceHtmlSha256:hash(report.html), preservedTextSha256:hash(text(tree)), reportSha256:hash(body+references), tables, citations, references:report.sources.length, charts:[...dashboard.matchAll(/<canvas[^>]*id="([^"]+)/g)].map(m=>m[1]) };
 manifest.reports.push(record);
 console.log(JSON.stringify(record));
}
fs.writeFileSync(`${root}/manifest.json`, JSON.stringify(manifest, null, 2)+'\n');
