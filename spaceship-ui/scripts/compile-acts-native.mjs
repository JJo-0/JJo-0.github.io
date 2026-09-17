import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

// Operator-only deterministic compiler. The ordinary Astro build performs no network request.
const directory = new URL('../src/data/acts-native/', import.meta.url);
const target = new URL('../site/assets/assets/interactive/acts-native/', import.meta.url);
const file = new URL('manifest.json', directory);
const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'acts-tailwind-'));
try {
  const input = path.join(temporary, 'input.css');
  fs.writeFileSync(input, '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
  for (const page of manifest.pages) {
    const html = fs.readFileSync(new URL(`${page.slug}.html`, directory), 'utf8');
    if (sha(html) !== page.sha256) throw new Error(`Unreviewed original: ${page.slug}`);
    const code = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
      .map((m) => m[1])
      .find((s) => /^\s*tailwind\.config\s*=/.test(s));
    const sandbox = { tailwind: {} };
    if (code) vm.runInNewContext(code, sandbox, { timeout: 100 });
    const config = { ...sandbox.tailwind.config, content: [{ raw: html, extension: 'html' }] };
    const configPath = path.join(temporary, `${page.slug}.cjs`);
    fs.writeFileSync(configPath, `module.exports=${JSON.stringify(config)};\n`);
    const output = new URL(`${page.slug}.css`, target);
    execFileSync(
      'pnpm',
      [
        'dlx',
        'tailwindcss@3.4.17',
        '-c',
        configPath,
        '-i',
        input,
        '-o',
        output.pathname,
        '--minify',
      ],
      { stdio: 'inherit' }
    );
    const generated =
      '/*! tailwindcss v3.4.17 | MIT License | https://tailwindcss.com */\n' +
      fs.readFileSync(output, 'utf8');
    fs.writeFileSync(output, generated);
    page.cssSha256 = sha(generated);
  }
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
