import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
let interBoldPromise: Promise<ArrayBuffer> | undefined;

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
  interBoldPromise ??= readLocalOutfitBold();
  return interBoldPromise;
}
