import type { APIRoute } from 'astro';
import html from '@/data/bible-english/acts-overview-2.html?raw';
export const prerender = true;
export const GET: APIRoute = () => new Response(html, {headers:{'Content-Type':'text/html; charset=utf-8'}});
