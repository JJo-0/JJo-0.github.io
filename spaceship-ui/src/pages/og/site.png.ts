import type { APIRoute } from 'astro';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import { SITE } from '@/config';

export const GET: APIRoute = async () => {
  const fontData = await fetch(
    'https://cdn.jsdelivr.net/fontsource/fonts/inter@5.0.19/latin-700-normal.woff'
  ).then((res) => res.arrayBuffer());

  const markup = html`
    <div
      style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #09090b;
        color: #fafafa;
        font-family: Inter;
        padding: 72px 80px;
      "
    >
      <div style="display: flex; align-items: center; gap: 28px;">
        <div
          style="
            width: 132px;
            height: 132px;
            border: 3px solid #22d3ee;
            border-radius: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 56px;
            font-weight: 700;
          "
        >JH</div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 58px; font-weight: 700;">${SITE.author}</div>
          <div style="font-size: 28px; color: #a1a1aa;">AI · Robotics · Research Notes</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="font-size: 42px; font-weight: 700;">${SITE.title}</div>
        <div style="font-size: 24px; color: #71717a;">${SITE.website.replace(/^https?:\/\//, '')}</div>
      </div>
    </div>
  `;

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render();

  return new Response(png.asPng() as any, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
