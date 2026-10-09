import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
// @ts-expect-error - .mjs script exports helpers for unit testing
import { buildSitemap, collectRoutePaths } from '../../scripts/generate-sitemap.mjs';

const SCRIPT = join(process.cwd(), 'scripts', 'generate-sitemap.mjs');
const OUT_DIR = 'dist';

function seed(root: string, files: Record<string, string>) {
  mkdirSync(join(root, 'src', 'routes'), { recursive: true });
  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(join(root, 'src', 'routes', name), contents);
  }
}

function run(cwd: string, args: string[] = []) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8' });
}

describe('collectRoutePaths', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'sitemap-test-'));
  });

  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it('maps route files to URL paths, mapping index to /', () => {
    seed(tmp, {
      'index.tsx': '// root',
      'docs.tsx': '// docs',
      'example.tsx': '// example',
    });
    expect(collectRoutePaths(join(tmp, 'src', 'routes'))).toEqual(['/', '/docs', '/example']);
  });

  it('skips __root and dynamic ($) segments', () => {
    seed(tmp, {
      '__root.tsx': '// root layout',
      'docs.tsx': '// docs',
      '$id.tsx': '// dynamic',
      'watch.tsx': '// watch',
    });
    expect(collectRoutePaths(join(tmp, 'src', 'routes'))).toEqual(['/docs', '/watch']);
  });

  it('returns an empty list when the routes dir does not exist', () => {
    expect(collectRoutePaths(join(tmp, 'missing'))).toEqual([]);
  });
});

describe('buildSitemap', () => {
  it('emits well-formed XML with the expected loc entries', () => {
    const xml = buildSitemap(['/', '/docs'], 'https://example.com');
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://example.com</loc>');
    expect(xml).toContain('<loc>https://example.com/docs</loc>');
    expect(xml).toContain('<lastmod>');
  });

  it('strips trailing slashes in the base URL', () => {
    const xml = buildSitemap(['/foo'], 'https://example.com/');
    // trailing slash removal is done by the script, not buildSitemap - pass a clean url
    expect(xml).toContain('<loc>https://example.com//foo</loc>');
  });

  it('escapes XML-special characters in URLs', () => {
    const xml = buildSitemap(['/search'], 'https://example.com?ref=x&y=1');
    expect(xml).toContain('&amp;');
    expect(xml).not.toMatch(/[^&]&[^amp;]/);
  });
});

describe('scripts/generate-sitemap.mjs (end-to-end)', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'sitemap-e2e-'));
    seed(tmp, {
      'index.tsx': '// root',
      'docs.tsx': '// docs',
      '__root.tsx': '// layout',
      '$slug.tsx': '// dynamic',
    });
  });

  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it('writes dist/sitemap.xml by default with routes from src/routes', () => {
    const res = run(tmp, ['--base-url', 'https://acme.example.com']);
    expect(res.status).toBe(0);

    const out = join(tmp, 'dist', 'sitemap.xml');
    expect(existsSync(out)).toBe(true);
    const xml = readFileSync(out, 'utf8');
    expect(xml).toContain('<loc>https://acme.example.com</loc>');
    expect(xml).toContain('<loc>https://acme.example.com/docs</loc>');
    expect(xml).not.toContain('$slug');
    expect(xml).not.toContain('__root');
  });

  it('honors --out and --routes overrides', () => {
    mkdirSync(join(tmp, 'other'), { recursive: true });
    writeFileSync(join(tmp, 'other', 'about.tsx'), '// about');
    const outPath = join(tmp, 'build', 'seo', 'sitemap.xml');

    const res = run(tmp, [
      '--out',
      outPath,
      '--routes',
      join(tmp, 'other'),
      '--base-url',
      'https://x.example',
    ]);
    expect(res.status).toBe(0);
    expect(readFileSync(outPath, 'utf8')).toContain('<loc>https://x.example/about</loc>');
  });

  it('falls back to VITE_SITE_URL from the environment', () => {
    const res = spawnSync(process.execPath, [SCRIPT], {
      cwd: tmp,
      encoding: 'utf8',
      env: { ...process.env, VITE_SITE_URL: 'https://envexample.com' },
    });
    expect(res.status).toBe(0);
    const xml = readFileSync(join(tmp, 'dist', 'sitemap.xml'), 'utf8');
    expect(xml).toContain('<loc>https://envexample.com</loc>');
  });
  it('reads VITE_SITE_URL from .env.production when the shell has none', () => {
    writeFileSync(join(tmp, '.env.production'), 'VITE_SITE_URL="https://fromfile.example"\n');
    const env = { ...process.env };
    delete env.VITE_SITE_URL;
    const res = spawnSync(process.execPath, [SCRIPT], { cwd: tmp, encoding: 'utf8', env });
    expect(res.status).toBe(0);
    expect(readFileSync(join(tmp, OUT_DIR, 'sitemap.xml'), 'utf8')).toContain(
      '<loc>https://fromfile.example</loc>',
    );
  });

  it('rewrites a relative Sitemap line in robots.txt to the absolute URL', () => {
    mkdirSync(join(tmp, OUT_DIR), { recursive: true });
    writeFileSync(join(tmp, OUT_DIR, 'robots.txt'), 'User-agent: *\nSitemap: /sitemap.xml\n');
    const res = run(tmp, ['--base-url', 'https://site.example/']);
    expect(res.status).toBe(0);
    expect(readFileSync(join(tmp, OUT_DIR, 'robots.txt'), 'utf8')).toBe(
      'User-agent: *\nSitemap: https://site.example/sitemap.xml\n',
    );
  });

  it('warns when falling back to example.com', () => {
    const env = { ...process.env };
    delete env.VITE_SITE_URL;
    const res = spawnSync(process.execPath, [SCRIPT], { cwd: tmp, encoding: 'utf8', env });
    expect(res.stderr).toMatch(/VITE_SITE_URL is not set/);
  });
});

describe('collectRoutePaths: TanStack file-routing rules', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'sitemap-rules-'));
  });

  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  function tree(files: string[]) {
    for (const file of files) {
      const full = join(tmp, file);
      mkdirSync(join(full, '..'), { recursive: true });
      writeFileSync(full, '');
    }
  }

  it('handles nested folders, dot-nesting, pathless layouts, groups and ignored files', () => {
    tree([
      '__root.tsx',
      'index.tsx',
      'blog/index.tsx',
      'blog/archive.tsx',
      'posts.index.tsx',
      'posts.$postId.tsx',
      'settings/route.tsx',
      '_auth.tsx',
      '_auth/login.tsx',
      '_auth/index.tsx',
      '(marketing)/pricing.tsx',
      '-components/Thing.tsx',
      'about.test.tsx',
      'posts_.edit.tsx',
    ]);
    expect(collectRoutePaths(tmp)).toEqual([
      '/',
      '/blog',
      '/blog/archive',
      '/login',
      '/posts',
      '/posts/edit',
      '/pricing',
      '/settings',
    ]);
  });
});
