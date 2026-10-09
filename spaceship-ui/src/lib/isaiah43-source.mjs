import fs from 'node:fs';
import { createHash } from 'node:crypto';
import manifest from '../data/isaiah43/manifest.json' with { type: 'json' };
const hash = s => createHash('sha256').update(s).digest('hex');
export function getIsaiahHtml(number) {
 const entry = manifest.reports.find(r => r.number === number);
 if (!entry) throw new Error('Unknown Isaiah dashboard');
 const source = fs.readFileSync(`src/data/isaiah43/dashboards/${number}.html`, 'utf8');
 if (hash(source) !== entry.dashboardSha256) throw new Error('Isaiah source hash mismatch');
 return source.replace('<script src="https://cdn.tailwindcss.com"></script>', `<link rel="stylesheet" href="/assets/interactive/isaiah43/${number}.css"><script>window.tailwind={};</script>`)
 .replace('<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>', '<script src="/assets/interactive/acts-native/chart.umd-4.4.8.js"></script>')
 .replace('</head>', '<link rel="stylesheet" href="/assets/interactive/isaiah43/adapter.css"><script src="/assets/interactive/isaiah43/adapter.js" defer></script></head>');
}
