import type { APIRoute } from 'astro';
import { getActsDashboardHtml } from '@/lib/acts-dashboard-source.mjs';

export const prerender = true;
export const GET: APIRoute = () => new Response(getActsDashboardHtml(5), {
  headers: { 'Content-Type': 'text/html; charset=utf-8' },
});
