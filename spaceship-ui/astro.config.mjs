// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import remarkEmoji from 'remark-emoji';
import modernAiPartOneReaderCleanup from './src/lib/remark/modern-ai-part1-reader-cleanup.mjs';
import modernAiPartTwoReaderCleanup from './src/lib/remark/modern-ai-part2-reader-cleanup.mjs';
import modernAiPartThreeReaderCleanup from './src/lib/remark/modern-ai-part3-reader-cleanup.mjs';
import modernAiPartFourReaderCleanup from './src/lib/remark/modern-ai-part4-reader-cleanup.mjs';
import modernAiPartFiveReaderCleanup from './src/lib/remark/modern-ai-part5-reader-cleanup.mjs';
import termTooltips from './src/lib/rehype/term-tooltips.mjs';
import mediaPerformance from './src/lib/rehype/media-performance.mjs';
import { isLegacyPathname } from './src/lib/legacy-posts.mjs';
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers';

import { SITE } from './site/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @param {string} page */
function includeInSitemap(page) {
  const pathname = new URL(page).pathname;

  if (isLegacyPathname(pathname)) return false;
  if (!SITE.publicSections.projects && pathname.startsWith('/projects')) return false;
  if (!SITE.publicSections.appearances && pathname.startsWith('/appearances')) return false;

  return true;
}

export default defineConfig({
  site: SITE.website,
  publicDir: 'site/assets',
  integrations: [
    svelte(),
    mdx(),
    sitemap({ filter: includeInSitemap }),
    partytown({ config: { forward: ['dataLayer.push'] } }),
  ],
  // Keep small route-specific CSS inline, but let shared/large styles become
  // hashed assets so Astro ClientRouter transitions reuse the browser cache.
  build: { inlineStylesheets: 'auto' },
  markdown: {
    shikiConfig: {
      themes: { light: 'min-light', dark: 'catppuccin-frappe' },
      defaultColor: false,
      wrap: true,
      transformers: [
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff(),
      ],
    },
    remarkPlugins: [
      remarkEmoji,
      modernAiPartOneReaderCleanup,
      modernAiPartTwoReaderCleanup,
      modernAiPartThreeReaderCleanup,
      modernAiPartFourReaderCleanup,
      modernAiPartFiveReaderCleanup,
    ],
    rehypePlugins: [
      termTooltips,
      mediaPerformance,
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          properties: { className: ['heading-link'], ariaLabel: 'Link to section' },
          content: { type: 'text', value: '#' },
        },
      ],
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
  },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  vite: {
    // Three.js stays behind the viewport-lazy renderer boundary. The dedicated
    // renderer/performance contracts enforce compressed payload budgets.
    build: { chunkSizeWarningLimit: 650 },
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@/config': path.resolve(__dirname, './site/config.ts'),
        '@/site-assets': path.resolve(__dirname, './site/assets'),
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});
