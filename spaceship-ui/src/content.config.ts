import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';
import { SITE } from '../site/config';
import { POST_CATEGORIES, POST_TYPES, RESEARCH_AREAS } from './lib/taxonomy.mjs';

const emptyCollectionLoader = async () => [];

const postSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    slug: z.string().optional(),
    updatedDate: z.date().optional(),
    category: z.enum(POST_CATEGORIES),
    subcategory: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    type: z.enum(POST_TYPES),
    tags: z.array(z.string()).min(2).max(5),
    featured: z.boolean().optional(),
    draft: z.boolean().default(false),
    ogImage: z.string().optional(),
    canonicalURL: z.url().optional(),
    showCTA: z.boolean().default(true),
    showComments: z.boolean().default(true),
    usesChart: z.boolean().default(false),
    lang: z.string().default('en'),
    researchArea: z.enum(RESEARCH_AREAS).optional(),
    researchFeatured: z.boolean().default(false),
    researchOrder: z.number().int().positive().optional(),
    series: z
      .object({
        id: z.string(),
        order: z.number(),
      })
      .optional(),
    translatedPosts: z.record(z.string(), z.string()).optional(), // lang -> slug mapping
  })
  .superRefine((post, context) => {
    if (post.researchFeatured && !post.researchArea) {
      context.addIssue({
        code: 'custom',
        path: ['researchArea'],
        message: 'researchFeatured posts require researchArea',
      });
    }

    if (post.researchFeatured && post.researchOrder === undefined) {
      context.addIssue({
        code: 'custom',
        path: ['researchOrder'],
        message: 'researchFeatured posts require researchOrder',
      });
    }

    if (!post.researchFeatured && post.researchOrder !== undefined) {
      context.addIssue({
        code: 'custom',
        path: ['researchOrder'],
        message: 'researchOrder is only valid when researchFeatured is true',
      });
    }
  });

const posts = defineCollection({
  loader: glob({
    pattern: ['**/*.{md,mdx}', '!**/_*'],
    base: './site/content/posts',
  }),
  schema: postSchema,
});

const projects = defineCollection({
  loader: SITE.publicSections.projects
    ? glob({
        pattern: ['**/*.{md,mdx}', '!**/_*'],
        base: './site/content/projects',
      })
    : emptyCollectionLoader,
  schema: z.object({
    title: z.string(),
    description: z.string(),
    link: z.url().optional(),
    github: z.url().optional(),
    tags: z.array(z.string()).default([]),
    types: z.array(z.enum(['commercial', 'open-source', 'social'])).default([]),
    image: z.string().optional(),
    order: z.number().default(0),
    directLink: z.boolean().default(false).optional(),
  }),
});

const appearances = defineCollection({
  loader: SITE.publicSections.appearances
    ? glob({
        pattern: ['**/*.{md,mdx}', '!**/_*'],
        base: './site/content/appearances',
      })
    : emptyCollectionLoader,
  schema: z.object({
    title: z.string(),
    event: z.string(),
    date: z.date(),
    type: z.enum(['talk', 'podcast', 'article', 'workshop', 'video']),
    media: z.enum(['video', 'audio', 'text']).optional(),
    link: z.url(),
    description: z.string().optional(),
    lang: z.string().default('en'),
    duration: z.string().optional(),
  }),
});

const about = defineCollection({
  loader: glob({
    pattern: ['**/*.{md,mdx}', '!**/_*'],
    base: './site/content/about',
  }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { posts, projects, appearances, about };
