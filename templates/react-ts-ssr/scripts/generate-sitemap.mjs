#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, parseEnv } from 'node:util';

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

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
  -b, --base-url <url>  Absolute site URL (default: VITE_SITE_URL from the environment or
                        .env / .env.production, else "https://example.com")
  -o, --out <path>      Output file (default: dist/client/sitemap.xml)
  -p, --pages <dir>     Vike pages directory (default: pages)

Walks the Vike pages/ directory and writes a sitemap.xml containing every
static route (each directory that contains a +Page.tsx). Route parameters
(@id) and error pages (_error) are skipped; (group) folders add no segment.`);
    process.exit(0);
  }

  const cwd = process.cwd();
  const pagesDir = resolve(cwd, values.pages ?? 'pages');
  const outPath = resolve(cwd, values.out ?? 'dist/client/sitemap.xml');
  const baseUrl = resolveBaseUrl(values['base-url'], cwd);
  if (baseUrl === DEFAULT_BASE_URL) {
    console.warn(
      `sitemap: VITE_SITE_URL is not set - URLs use ${DEFAULT_BASE_URL}. Set it in .env.production or the build environment.`,
    );
  }

  const paths = collectRoutePaths(pagesDir);
  const xml = buildSitemap(paths, baseUrl);

  mkdirSync(join(outPath, '..'), { recursive: true });
  writeFileSync(outPath, xml);
  absolutizeRobots(join(outPath, '..', 'robots.txt'), `${baseUrl}/${basename(outPath)}`);

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
      if (entry.startsWith('@')) continue; // route parameters: needs a list of values
      const full = join(dir, entry);
      let s;
      try {
        s = statSync(full);
      } catch {
        continue;
      }
      if (!s.isDirectory()) continue;

      // index/ and (group)/ folders don't add a URL segment.
      const transparent = entry === 'index' || /^\(.*\)$/.test(entry);
      const url = transparent ? urlSoFar || '/' : `${urlSoFar}/${entry}`;
      if (hasPageFile(full)) paths.push(url);
      walk(full, transparent ? urlSoFar : url);
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

const DEFAULT_BASE_URL = 'https://example.com';

// Same files, same precedence as `vite build` (later files win).
const ENV_FILES = ['.env', '.env.local', '.env.production', '.env.production.local'];

function readEnvFiles(cwd) {
  const merged = {};
  for (const file of ENV_FILES) {
    const path = join(cwd, file);
    if (existsSync(path)) Object.assign(merged, parseEnv(readFileSync(path, 'utf8')));
  }
  return merged;
}

// Flag, then the shell, then the project's .env files for production mode, so
// a VITE_SITE_URL in .env.production works without exporting it.
export function resolveBaseUrl(flag, cwd) {
  const fromFiles = readEnvFiles(cwd).VITE_SITE_URL;
  const url = flag || process.env.VITE_SITE_URL || fromFiles || DEFAULT_BASE_URL;
  return url.replace(/\/$/, '');
}

// robots.txt must point at the sitemap with an absolute URL; the template ships
// a relative placeholder because the domain isn't known until build time.
export function absolutizeRobots(robotsPath, sitemapUrl) {
  if (!existsSync(robotsPath)) return;
  const robots = readFileSync(robotsPath, 'utf8');
  const next = robots.replace(/^Sitemap:\s*\/.*$/m, `Sitemap: ${sitemapUrl}`);
  if (next !== robots) writeFileSync(robotsPath, next);
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

if (isMain) main();
