import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const root = pathToFileURL(path.resolve('src/data/acts-native') + path.sep);
const manifest = JSON.parse(fs.readFileSync(new URL('manifest.json', root), 'utf8'));
const series = JSON.parse(fs.readFileSync(path.resolve('src/data/acts-series.json'), 'utf8'));
const sha = (value) => createHash('sha256').update(value).digest('hex');
const cache = new Map();
const assets = '/assets/interactive/acts-native';

/** Restore source typography only; retain the already-approved overview colors and functional fixes. */
export function applyOriginalOverviewFonts(html, order) {
  if (![1, 2, 3].includes(order)) throw new Error('Invalid overview order');
  const headingRule = /html body :is\(h1,h2,h3,h4,h5,h6\), html body \.font-serif \{[^}]*\}/g;
  if (!headingRule.test(html))
    throw new Error('Overview font adapter changed; review before applying');
  html = html
    .replace(headingRule, '/* Source heading typography retained. */')
    .replace(/html body :is\(button,input,select,textarea\), html body \.font-sans \{[^}]*\}/g, '')
    .replace(/html body \.font-mono \{[^}]*\}/g, '')
    .replace(/font-family:\s*var\(--jjo-reading\)\s*(?:!important)?\s*;/g, '')
    .replace('line-height: 1.7; overflow-x: visible;', 'overflow-x: visible;')
    .replace('color:p.ink,font:{...legend.labels.font,family:p.font}', 'color:p.ink')
    .replace('title.color=p.ink; title.font={...title.font,family:p.font};', 'title.color=p.ink;')
    .replace('color:p.ink,font:{...r.pointLabels?.font,family:p.font,size:10}', 'color:p.ink')
    .replace("font:value('--jjo-reading')", 'font:getComputedStyle(document.body).fontFamily');
  // Overview 1 uses Tailwind's original sans stack. 2 and 3 declare their body fonts in the source.
  const sans =
    order === 1
      ? "ui-sans-serif,system-ui,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'"
      : order === 2
        ? "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"
        : "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif";
  const serif =
    order === 2
      ? 'Georgia,Cambria,serif'
      : "ui-serif,Georgia,Cambria,'Times New Roman',Times,serif";
  return html.replace(
    '</head>',
    `<style data-original-typography>:root{--font-sans:${sans};--font-serif:${serif}}html body{font-family:${sans}}html body .source-chart-caption{font-family:inherit}</style></head>`
  );
}

/** Read the unedited upload, then apply only explicit hosting/presentation adapters. */
export function getNativeActsHtml(order) {
  if (cache.has(order)) return cache.get(order);
  const record = manifest.pages.find((page) => page.order === order);
  const entry = series.entries.find((page) => page.order === order);
  if (
    !record ||
    !entry ||
    record.slug !== entry.slug ||
    !/^acts-1-(1-5|6-14)-[123]$/.test(record.slug)
  )
    throw new Error(`Unknown native Acts dashboard ${order}`);
  const original = fs.readFileSync(new URL(`${record.slug}.html`, root));
  if (original.length !== record.bytes || sha(original) !== record.sha256)
    throw new Error(`Native Acts source changed: ${record.slug}`);
  const css = fs.readFileSync(path.resolve(`site/assets${assets}/${record.slug}.css`));
  if (sha(css) !== record.cssSha256)
    throw new Error(`Recompile native Acts styles: ${record.slug}`);
  let html = original.toString('utf8');
  const tailwind = '<script src="https://cdn.tailwindcss.com"></script>';
  const chart = '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>';
  if (html.split(tailwind).length !== 2 || html.split(chart).length !== 2)
    throw new Error('Unexpected source dependency tags');
  html = html
    .replace(
      tailwind,
      `<link rel="stylesheet" href="${assets}/${record.slug}.css"><script>window.tailwind={};</script>`
    )
    .replace(chart, `<script src="${assets}/chart.umd-4.4.8.js"></script>`)
    .replace('<html lang="ko">', `<html lang="ko" data-acts-native="${record.slug}">`);
  // The upload's nonexistent family makes Google reject both families in one request.
  // Keep its body stack and native fallback; request only its genuine Noto Serif KR heading font.
  if (order === 6)
    html = html.replace(
      'family=Noto+Serif+KR:wght@400;600;700&family=Sans+Serif+KR:wght@300;400;500;600;700&display=swap',
      'family=Noto+Serif+KR:wght@400;600;700&display=swap'
    );
  html = html.replace(
    '</head>',
    `<link rel="stylesheet" href="${assets}/adapter.css"><script src="${assets}/adapter.js" defer></script></head>`
  );
  const tools = `<div class="acts-native-tools"><a href="/posts/${record.slug}" target="_top">← 글로 돌아가기</a><button type="button" data-native-theme>화면 테마 전환</button></div>`;
  const credit = `<details class="acts-native-source"><summary>원문·출처 펼쳐보기</summary><a href="${entry.source}" target="_blank" rel="noopener noreferrer">Gemini 공유 원문 ↗</a><p>제공된 HTML의 본문·도표 값·원본 글꼴을 유지했습니다. 원자료의 학술 판정과 동료심사 표기는 독립 검증 완료를 의미하지 않습니다.</p></details>`;
  html = html.replace(/(<body\b[^>]*>)/, `$1${tools}`).replace('</body>', `${credit}</body>`);
  cache.set(order, html);
  return html;
}
