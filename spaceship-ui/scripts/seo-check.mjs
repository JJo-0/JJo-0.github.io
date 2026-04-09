#!/usr/bin/env node
/**
 * SEO metadata validator for Astro posts.
 * Checks that every post in site/content/posts/ has required SEO fields.
 * Exits with code 1 if any violations are found.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, '..', 'site', 'content', 'posts');

const REQUIRED_FIELDS = ['title', 'description', 'pubDate'];
const DESC_MIN_LENGTH = 10;
const DESC_MAX_LENGTH = 160;

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const fm = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key) fm[key] = value;
  }
  return fm;
}

function collectFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('_')) continue; // skip _template etc
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
const errors = [];

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const fm = parseFrontmatter(content);
  const rel = file.replace(POSTS_DIR + '/', '');

  if (!fm) {
    errors.push(`${rel}: frontmatter 없음`);
    continue;
  }

  for (const field of REQUIRED_FIELDS) {
    if (!fm[field]) {
      errors.push(`${rel}: '${field}' 누락`);
    }
  }

  if (fm.description) {
    if (fm.description.length < DESC_MIN_LENGTH) {
      errors.push(`${rel}: description 너무 짧음 (${fm.description.length}자, 최소 ${DESC_MIN_LENGTH}자)`);
    }
    if (fm.description.length > DESC_MAX_LENGTH) {
      errors.push(`${rel}: description 너무 김 (${fm.description.length}자, 최대 ${DESC_MAX_LENGTH}자)`);
    }
  }
}

if (errors.length > 0) {
  console.error(`\n❌ SEO check 실패 — ${errors.length}개 문제 발견:\n`);
  for (const e of errors) console.error(`  • ${e}`);
  console.error('');
  process.exit(1);
} else {
  console.log(`✅ SEO check 통과 — ${files.length}개 포스트 모두 정상`);
}
