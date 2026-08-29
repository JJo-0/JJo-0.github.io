/** Render a Markdown post into Blogger-safe article HTML.
 *
 * Usage: node scripts/render-blogger-post.mjs <input.md> <output.html>
 * Keep this deliberately narrow: Blogger receives only reader prose and a small
 * metadata comment understood by the publishing harness.
 */
import fs from 'node:fs';
import process from 'node:process';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  throw new Error('Usage: node scripts/render-blogger-post.mjs <input.md> <output.html>');
}

const raw = fs.readFileSync(input, 'utf8');
const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!match) throw new Error('Expected YAML front matter.');
const frontmatter = match[1];
const body = match[2];
const title = frontmatter.match(/^title:\s*'(.+)'$/m)?.[1];
if (!title) throw new Error('Expected a single-quoted front matter title.');
const labels = ['반도체', 'AI', 'EDA', '강의노트'];
const rendered = String(
  await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(body),
);
const html = `<!-- 권장 제목: ${title}\n권장 라벨: ${labels.join(', ')}\n-->\n` +
  `<div class="article-body">\n${rendered}\n</div>\n`;
fs.writeFileSync(output, html, 'utf8');
