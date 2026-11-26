import type { APIRoute, GetStaticPaths } from 'astro';
import { renderAtlasPreview } from '@/lib/experience/graph-preview.mjs';
import { getWritingGraph } from '@/lib/experience/writing-graph';

export const prerender = true;
export const getStaticPaths = (() =>
  ['ko', 'en'].flatMap(locale => ['light', 'dark'].map(theme => ({
    params: { edition: `${locale}-${theme}` },
    props: { english: locale === 'en', dark: theme === 'dark' },
  })))
) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const graph = await getWritingGraph(props.english);
  return new Response(renderAtlasPreview(graph, props.dark), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
};
