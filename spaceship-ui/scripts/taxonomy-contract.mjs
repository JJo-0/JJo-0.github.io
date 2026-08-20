import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  POST_CATEGORIES,
  POST_TYPES,
  RESEARCH_AREAS,
} from '../src/lib/taxonomy.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.resolve(HERE, '../site/content/posts');

const CATEGORY_SET = new Set(POST_CATEGORIES);
const TYPE_SET = new Set(POST_TYPES);
const RESEARCH_AREA_SET = new Set(RESEARCH_AREAS);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const STRUCTURAL_TAGS = new Set([
  'projects',
  'resources',
  'areas',
  'study-notes',
  'research-paper',
  'system-setup',
  'tools-guides',
  'interactive-ui',
  'product-research',
  'code-analysis',
  'research-analysis',
  'graduation-project',
]);

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    trimmed.length >= 2 &&
    trimmed[0] === trimmed.at(-1) &&
    (trimmed[0] === "'" || trimmed[0] === '"')
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function splitFrontmatter(text, filename) {
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') {
    throw new Error(`${filename}: frontmatter must start on line 1`);
  }

  const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (end === -1) {
    throw new Error(`${filename}: closing frontmatter delimiter not found`);
  }

  return lines.slice(1, end);
}

function topLevelMatches(lines, key) {
  const pattern = new RegExp(`^${key}:\\s*(.*?)\\s*$`);
  return lines
    .map((line, index) => {
      const match = line.match(pattern);
      return match ? { index, value: match[1] } : null;
    })
    .filter(Boolean);
}

function requiredScalar(lines, key, filename) {
  const matches = topLevelMatches(lines, key);
  if (matches.length !== 1) {
    throw new Error(
      `${filename}: expected exactly one top-level ${key}, found ${matches.length}`,
    );
  }

  const value = stripQuotes(matches[0].value);
  if (!value || value.startsWith('[') || value.startsWith('{')) {
    throw new Error(`${filename}: ${key} must be one scalar value`);
  }
  return value;
}

function optionalScalar(lines, key, filename) {
  const matches = topLevelMatches(lines, key);
  if (matches.length > 1) {
    throw new Error(`${filename}: duplicate top-level ${key}`);
  }
  if (matches.length === 0) return undefined;

  const value = stripQuotes(matches[0].value);
  if (!value || value.startsWith('[') || value.startsWith('{')) {
    throw new Error(`${filename}: ${key} must be one scalar value`);
  }
  return value;
}

function parseBoolean(lines, key, filename) {
  const value = requiredScalar(lines, key, filename);
  if (value !== 'true' && value !== 'false') {
    throw new Error(`${filename}: ${key} must be true or false`);
  }
  return value === 'true';
}

function parseTags(lines, filename) {
  const matches = topLevelMatches(lines, 'tags');
  if (matches.length !== 1) {
    throw new Error(
      `${filename}: expected exactly one top-level tags field, found ${matches.length}`,
    );
  }

  const { index, value } = matches[0];
  const tags = [];

  if (value.trim()) {
    const inline = value.trim();
    if (!inline.startsWith('[') || !inline.endsWith(']')) {
      throw new Error(`${filename}: inline tags must use [a, b] syntax`);
    }
    const inner = inline.slice(1, -1).trim();
    if (inner) {
      tags.push(...inner.split(',').map((tag) => stripQuotes(tag)));
    }
  } else {
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      if (/^[A-Za-z][A-Za-z0-9]*\s*:/.test(lines[cursor])) break;
      const item = lines[cursor].match(/^\s+-\s+(.+?)\s*$/);
      if (item) tags.push(stripQuotes(item[1]));
    }
  }

  if (tags.length < 2 || tags.length > 5) {
    throw new Error(`${filename}: tags must contain 2-5 semantic values`);
  }
  if (new Set(tags).size !== tags.length) {
    throw new Error(`${filename}: duplicate tags are not allowed`);
  }

  for (const tag of tags) {
    if (!SLUG_PATTERN.test(tag)) {
      throw new Error(`${filename}: invalid semantic tag ${JSON.stringify(tag)}`);
    }
    if (STRUCTURAL_TAGS.has(tag)) {
      throw new Error(
        `${filename}: structural value ${JSON.stringify(tag)} cannot be a semantic tag`,
      );
    }
  }

  return tags;
}

function parsePositiveInteger(value, key, filename) {
  if (!/^[1-9][0-9]*$/.test(value)) {
    throw new Error(`${filename}: ${key} must be a positive integer`);
  }
  return Number(value);
}

async function postFilenames() {
  const entries = await readdir(POSTS_DIR, { withFileTypes: true });
  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        !entry.name.startsWith('_') &&
        /\.(md|mdx)$/i.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort();
}

const filenames = await postFilenames();
const failures = [];
const categoryCounts = new Map(POST_CATEGORIES.map((category) => [category, 0]));
const featuredOrders = new Map();

for (const filename of filenames) {
  try {
    const text = await readFile(path.join(POSTS_DIR, filename), 'utf8');
    const frontmatter = splitFrontmatter(text, filename);

    const category = requiredScalar(frontmatter, 'category', filename);
    const subcategory = requiredScalar(frontmatter, 'subcategory', filename);
    const type = requiredScalar(frontmatter, 'type', filename);
    const tags = parseTags(frontmatter, filename);
    const researchArea = optionalScalar(frontmatter, 'researchArea', filename);
    const researchFeatured = parseBoolean(
      frontmatter,
      'researchFeatured',
      filename,
    );
    const researchOrderRaw = optionalScalar(
      frontmatter,
      'researchOrder',
      filename,
    );

    if (!CATEGORY_SET.has(category)) {
      throw new Error(`${filename}: unknown category ${JSON.stringify(category)}`);
    }
    if (!SLUG_PATTERN.test(subcategory)) {
      throw new Error(
        `${filename}: invalid subcategory ${JSON.stringify(subcategory)}`,
      );
    }
    if (!TYPE_SET.has(type)) {
      throw new Error(`${filename}: unknown type ${JSON.stringify(type)}`);
    }
    if (researchArea && !RESEARCH_AREA_SET.has(researchArea)) {
      throw new Error(
        `${filename}: unknown researchArea ${JSON.stringify(researchArea)}`,
      );
    }

    let researchOrder;
    if (researchOrderRaw !== undefined) {
      researchOrder = parsePositiveInteger(
        researchOrderRaw,
        'researchOrder',
        filename,
      );
    }

    if (researchFeatured && !researchArea) {
      throw new Error(`${filename}: featured research requires researchArea`);
    }
    if (researchFeatured && researchOrder === undefined) {
      throw new Error(`${filename}: featured research requires researchOrder`);
    }
    if (!researchFeatured && researchOrder !== undefined) {
      throw new Error(
        `${filename}: researchOrder is only valid for featured research`,
      );
    }

    if (researchFeatured) {
      const key = `${researchArea}:${researchOrder}`;
      const previous = featuredOrders.get(key);
      if (previous) {
        throw new Error(
          `${filename}: duplicate research order with ${previous} (${key})`,
        );
      }
      featuredOrders.set(key, filename);
    }

    categoryCounts.set(category, categoryCounts.get(category) + 1);

    // Keep the variable read so a future contract can add per-tag statistics
    // without changing the parser path.
    void tags;
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }
}

if (failures.length > 0) {
  console.error(`Taxonomy contract failed for ${failures.length} item(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Taxonomy contract passed: ${filenames.length} posts`);
for (const category of POST_CATEGORIES) {
  console.log(`- ${category}: ${categoryCounts.get(category)}`);
}
console.log(`- curated research posts: ${featuredOrders.size}`);
