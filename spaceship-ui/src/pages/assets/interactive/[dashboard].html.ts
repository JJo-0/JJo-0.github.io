import type { APIRoute } from 'astro';
import { getActsDashboardHtml } from '@/lib/acts-dashboard-source.mjs';

export const prerender = true;
export function getStaticPaths() {
  return [1, 2, 3].map((order) => ({
    params: { dashboard: `acts-overview-${order}` }, props: { order },
  }));
}
export const GET: APIRoute = ({ props }) => new Response(getActsDashboardHtml(props.order), {
  headers: { 'Content-Type': 'text/html; charset=utf-8' },
});
