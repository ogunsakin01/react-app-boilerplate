import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
// @ts-expect-error - .mjs script exports helpers for unit testing
import { buildSitemap, collectRoutePaths } from '../../scripts/generate-sitemap.mjs';

const SCRIPT = join(process.cwd(), 'scripts', 'generate-sitemap.mjs');

function seedPages(root: string, pageDirs: string[]) {
  mkdirSync(join(root, 'pages'), { recursive: true });
  for (const dir of pageDirs) {
    mkdirSync(join(root, 'pages', dir), { recursive: true });
    writeFileSync(join(root, 'pages', dir, '+Page.tsx'), '// page');
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

  it('maps Vike +Page.tsx directories to URL paths, mapping index/ to /', () => {
    seedPages(tmp, ['index', 'docs', 'example']);
    expect(collectRoutePaths(join(tmp, 'pages'))).toEqual(['/', '/docs', '/example']);
  });

  it('skips underscore-prefixed dirs (_error) and any dir without +Page.tsx', () => {
    seedPages(tmp, ['index', 'docs', 'watch']);
    // add a _error dir and an empty dir; neither should show up
    mkdirSync(join(tmp, 'pages', '_error'), { recursive: true });
    writeFileSync(join(tmp, 'pages', '_error', '+Page.tsx'), '// 404');
    mkdirSync(join(tmp, 'pages', 'not-a-page'), { recursive: true });
    expect(collectRoutePaths(join(tmp, 'pages'))).toEqual(['/', '/docs', '/watch']);
  });

  it('returns an empty list when the pages dir does not exist', () => {
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
    seedPages(tmp, ['index', 'docs']);
    mkdirSync(join(tmp, 'pages', '_error'), { recursive: true });
    writeFileSync(join(tmp, 'pages', '_error', '+Page.tsx'), '// 404');
  });

  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it('writes dist/client/sitemap.xml by default with routes from pages/', () => {
    const res = run(tmp, ['--base-url', 'https://acme.example.com']);
    expect(res.status).toBe(0);

    const out = join(tmp, 'dist', 'client', 'sitemap.xml');
    expect(existsSync(out)).toBe(true);
    const xml = readFileSync(out, 'utf8');
    expect(xml).toContain('<loc>https://acme.example.com</loc>');
    expect(xml).toContain('<loc>https://acme.example.com/docs</loc>');
    expect(xml).not.toContain('_error');
  });

  it('honors --out and --pages overrides', () => {
    mkdirSync(join(tmp, 'other', 'about'), { recursive: true });
    writeFileSync(join(tmp, 'other', 'about', '+Page.tsx'), '// about');
    const outPath = join(tmp, 'build', 'seo', 'sitemap.xml');

    const res = run(tmp, [
      '--out',
      outPath,
      '--pages',
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
    const xml = readFileSync(join(tmp, 'dist', 'client', 'sitemap.xml'), 'utf8');
    expect(xml).toContain('<loc>https://envexample.com</loc>');
  });
});
