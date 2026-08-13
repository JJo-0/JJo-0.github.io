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
import remarkRepairLiteralStrong from './src/lib/remark-repair-literal-strong.mjs';
import restoreLegacyHtml from './src/lib/remark/restore-legacy-html.mjs';
import fixLegacyFragments from './src/lib/rehype/fix-legacy-fragments.mjs';
import termTooltips from './src/lib/rehype/term-tooltips.mjs';
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

  if (!SITE.publicSections.projects && pathname.startsWith('/projects')) return false;
  if (!SITE.publicSections.appearances && pathname.startsWith('/appearances')) return false;

  return true;
}

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  publicDir: 'site/assets',
  integrations: [
    svelte(),
    mdx(),
    sitemap({ filter: includeInSitemap }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  build: {
    inlineStylesheets: 'always',
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: 'min-light',
        dark: 'catppuccin-frappe',
      },
      defaultColor: false,
      wrap: true,
      transformers: [
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff(),
      ],
    },
    remarkPlugins: [restoreLegacyHtml, remarkEmoji, remarkRepairLiteralStrong],
    rehypePlugins: [
      termTooltips,
      rehypeSlug,
      fixLegacyFragments,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          properties: {
            className: ['heading-link'],
            ariaLabel: 'Link to section',
          },
          content: {
            type: 'text',
            value: '#',
          },
        },
      ],
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
        },
      ],
    ],
  },

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },

  vite: {
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
