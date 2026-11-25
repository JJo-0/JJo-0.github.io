import type { APIRoute, GetStaticPaths } from 'astro';
import { getWritingGraph } from '@/lib/experience/writing-graph';
import { serializeGraphPayload } from '@/lib/experience/graph-json.mjs';

export const prerender = true;
export const getStaticPaths = (() => [
  { params: { lang: 'ko' } },
  { params: { lang: 'en' } },
]) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const graph = await getWritingGraph(params.lang === 'en');
  return new Response(serializeGraphPayload(graph), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
