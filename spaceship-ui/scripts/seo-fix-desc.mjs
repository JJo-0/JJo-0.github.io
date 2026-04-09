#!/usr/bin/env node
/**
 * Auto-fixes missing or empty description fields in post frontmatter.
 * Extracts the first meaningful sentence from post body as description.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, '..', 'site', 'content', 'posts');
const MAX_DESC = 155;

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { fm: null, body: content };
  return { raw: match[1], body: content.slice(match[0].length) };
}

function hasDescription(raw) {
  return /^description\s*:/m.test(raw);
}

function extractDescription(body) {
  // Strip HTML tags, markdown headings, images, links, code blocks
  const text = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s+.*/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_~>#|-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const first = text.split(/[.。]\s+/)[0].trim();
  const desc = first.length > MAX_DESC ? first.slice(0, MAX_DESC - 1) + '…' : first;
  return desc || '내용 요약';
}

function collectFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('_')) continue;
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else if (['.md', '.mdx'].includes(extname(entry))) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = collectFiles(POSTS_DIR);
let fixed = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const { raw, body } = parseFrontmatter(content);
  const rel = file.replace(POSTS_DIR + '/', '');

  if (!raw) {
    console.warn(`⚠️  ${rel}: frontmatter 없음, 건너뜀`);
    continue;
  }

  if (hasDescription(raw)) continue;

  const desc = extractDescription(body);
  const newFm = raw + `\ndescription: '${desc.replace(/'/g, "\\'")}'`;
  const newContent = `---\n${newFm}\n---${body}`;
  writeFileSync(file, newContent, 'utf-8');
  console.log(`✏️  ${rel}: description 추가 → "${desc}"`);
  fixed++;
}

if (fixed === 0) {
  console.log('✅ 모든 포스트에 description이 있습니다.');
} else {
  console.log(`\n✅ ${fixed}개 포스트 수정 완료`);
}
