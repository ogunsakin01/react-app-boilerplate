#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
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
      routes: { type: 'string', short: 'r' },
      help: { type: 'boolean' },
    },
  });

  if (values.help) {
    console.log(`Usage: node scripts/generate-sitemap.mjs [options]

Options:
  -b, --base-url <url>  Absolute site URL (default: $VITE_SITE_URL or "https://example.com")
  -o, --out <path>      Output file (default: dist/sitemap.xml)
  -r, --routes <dir>    Routes directory (default: src/routes)

Walks the TanStack Router file-based routes directory and writes a sitemap.xml
containing every static route. Dynamic routes ($param) are skipped - extend this
script if you need dynamic entries (e.g. blog posts pulled from a CMS).`);
    process.exit(0);
  }

  const cwd = process.cwd();
  const routesDir = resolve(cwd, values.routes ?? 'src/routes');
  const outPath = resolve(cwd, values.out ?? 'dist/sitemap.xml');
  const baseUrl = (
    values['base-url'] ??
    process.env.VITE_SITE_URL ??
    'https://example.com'
  ).replace(/\/$/, '');

  const paths = collectRoutePaths(routesDir);
  const xml = buildSitemap(paths, baseUrl);

  mkdirSync(join(outPath, '..'), { recursive: true });
  writeFileSync(outPath, xml);

  console.log(
    `sitemap: wrote ${paths.length} URL${paths.length === 1 ? '' : 's'} to ${outPath} (base ${baseUrl})`,
  );
}

export function collectRoutePaths(dir) {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir, { withFileTypes: true });
  const paths = [];
  for (const entry of files) {
    if (entry.isDirectory()) continue;
    const name = entry.name;
    if (!name.endsWith('.tsx') && !name.endsWith('.ts')) continue;
    if (name.startsWith('__')) continue;
    const stem = name.replace(/\.(tsx|ts)$/, '');
    if (stem.includes('$')) continue;
    paths.push(stem === 'index' ? '/' : `/${stem}`);
  }
  return paths.sort();
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
