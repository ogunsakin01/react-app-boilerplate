#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMain) main();

function main() {
  const { values } = parseArgs({
    options: {
      out: { type: 'string', short: 'o' },
      'base-url': { type: 'string', short: 'b' },
      pages: { type: 'string', short: 'p' },
      help: { type: 'boolean' },
    },
  });

  if (values.help) {
    console.log(`Usage: node scripts/generate-sitemap.mjs [options]

Options:
  -b, --base-url <url>  Absolute site URL (default: $VITE_SITE_URL or "https://example.com")
  -o, --out <path>      Output file (default: dist/client/sitemap.xml)
  -p, --pages <dir>     Vike pages directory (default: pages)

Walks the Vike pages/ directory and writes a sitemap.xml containing every
static route (each directory that contains a +Page.tsx). Dynamic routes and
error pages (_error) are skipped.`);
    process.exit(0);
  }

  const cwd = process.cwd();
  const pagesDir = resolve(cwd, values.pages ?? 'pages');
  const outPath = resolve(cwd, values.out ?? 'dist/client/sitemap.xml');
  const baseUrl = (
    values['base-url'] ??
    process.env.VITE_SITE_URL ??
    'https://example.com'
  ).replace(/\/$/, '');

  const paths = collectRoutePaths(pagesDir);
  const xml = buildSitemap(paths, baseUrl);

  mkdirSync(join(outPath, '..'), { recursive: true });
  writeFileSync(outPath, xml);

  console.log(
    `sitemap: wrote ${paths.length} URL${paths.length === 1 ? '' : 's'} to ${outPath} (base ${baseUrl})`,
  );
}

export function collectRoutePaths(pagesDir) {
  if (!existsSync(pagesDir)) return [];
  const paths = [];

  function walk(dir, urlSoFar) {
    for (const entry of readdirSync(dir)) {
      if (entry.startsWith('_')) continue; // _error, etc.
      const full = join(dir, entry);
      let s;
      try {
        s = statSync(full);
      } catch {
        continue;
      }
      if (!s.isDirectory()) continue;

      const url = entry === 'index' ? urlSoFar || '/' : `${urlSoFar}/${entry}`;
      if (hasPageFile(full)) paths.push(url);
      walk(full, entry === 'index' ? urlSoFar : url);
    }
  }

  if (hasPageFile(pagesDir)) paths.push('/');
  walk(pagesDir, '');
  return [...new Set(paths)].sort();
}

function hasPageFile(dir) {
  for (const ext of ['tsx', 'ts', 'jsx', 'js']) {
    if (existsSync(join(dir, `+Page.${ext}`))) return true;
  }
  return false;
}

export function buildSitemap(paths, baseUrl) {
  const now = new Date().toISOString().slice(0, 10);
  const urls = paths
    .map(
      (p) => `  <url>
    <loc>${escape(`${baseUrl}${p === '/' ? '' : p}`)}</loc>
    <lastmod>${now}</lastmod>
  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function escape(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
