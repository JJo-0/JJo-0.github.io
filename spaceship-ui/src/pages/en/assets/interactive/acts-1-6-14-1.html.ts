import type { APIRoute } from 'astro';
import html from '@/data/bible-english/acts-1-6-14-1.html?raw';
export const prerender = true;
export const GET: APIRoute = () => new Response(html, {headers:{'Content-Type':'text/html; charset=utf-8'}});
