import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
let ogBoldFontPromise: Promise<ArrayBuffer> | undefined;
let ogKoreanBoldFontPromise: Promise<ArrayBuffer> | undefined;
const supportFontPromises = new Map<string, Promise<ArrayBuffer>>();

function getSupportFont(file: string): Promise<ArrayBuffer> {
  let promise = supportFontPromises.get(file);
  if (!promise) {
    promise = readFile(path.resolve('site/assets/fonts', file)).then((buffer) =>
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer,
    );
    supportFontPromises.set(file, promise);
  }
  return promise;
}

async function readLocalOutfitBold(): Promise<ArrayBuffer> {
  // Resolve from the installed package instead of reaching the network during prerender.
  const cssPath = require.resolve('@fontsource/outfit/700.css');
  const filesDir = path.join(path.dirname(cssPath), 'files');
  const files = await readdir(filesDir);
  const fontFile = files.find((file) => file === 'outfit-latin-700-normal.woff');

  if (!fontFile) {
    throw new Error(
      'OG font file outfit-latin-700-normal.woff is missing from @fontsource/outfit',
    );
  }

  const buffer = await readFile(path.join(filesDir, fontFile));
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

export function getOgBoldFont(): Promise<ArrayBuffer> {
  ogBoldFontPromise ??= readLocalOutfitBold();
  return ogBoldFontPromise;
}

export function getOgKoreanBoldFont(): Promise<ArrayBuffer> {
  // Build-time only; use the bundled, unmodified OFL font, never host fonts or a CDN.
  ogKoreanBoldFontPromise ??= readFile(
    path.resolve('site/assets/fonts/NanumGothic-Bold.ttf'),
  ).then((buffer) => buffer.buffer.slice(
    buffer.byteOffset, buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer);
  return ogKoreanBoldFontPromise;
}

export async function getOgFonts() {
  const [latin, korean, scientific, symbols] = await Promise.all([
    getOgBoldFont(), getOgKoreanBoldFont(),
    getSupportFont('NotoSans-Bold.ttf'), getSupportFont('NotoSansSymbols-Regular.ttf'),
  ]);
  return [
    { name: 'Outfit', data: latin, weight: 700 as const, style: 'normal' as const },
    { name: 'NanumGothic', data: korean, weight: 700 as const, style: 'normal' as const },
    { name: 'NotoSans', data: scientific, weight: 700 as const, style: 'normal' as const },
    { name: 'NotoSansSymbols', data: symbols, weight: 400 as const, style: 'normal' as const },
  ];
}
