import { getIsaiahHtml } from '@/lib/isaiah43-source.mjs';
export const GET = () => new Response(getIsaiahHtml(1), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
