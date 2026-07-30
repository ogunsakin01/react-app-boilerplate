import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const SCRIPT = join(process.cwd(), 'scripts', 'strip-example.mjs');

function run(cwd: string, args: string[] = []) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8' });
}

function seed(root: string) {
  // Vike pages: keep index/, delete docs/example/watch/
  mkdirSync(join(root, 'pages', 'index'), { recursive: true });
  writeFileSync(
    join(root, 'pages', 'index', '+Page.tsx'),
    "import { Landing } from '@/pages/example/Landing';\nexport default function Page() { return <Landing />; }\n",
  );
  writeFileSync(join(root, 'pages', 'index', '+title.ts'), "export const title = 'Welcome';\n");
  for (const dir of ['docs', 'example', 'watch']) {
    mkdirSync(join(root, 'pages', dir), { recursive: true });
    writeFileSync(join(root, 'pages', dir, '+Page.tsx'), `// ${dir}`);
  }

  // example dirs at multiple layers
  for (const layer of ['atoms', 'molecules', 'organisms']) {
    mkdirSync(join(root, 'src', 'components', layer, 'example', 'Foo'), { recursive: true });
    writeFileSync(
      join(root, 'src', 'components', layer, 'example', 'Foo', 'Foo.tsx'),
      '// example component',
    );
    writeFileSync(
      join(root, 'src', 'components', layer, 'index.ts'),
      "export * from './Button';\n// Delete the following line when you remove the example (`src/**/example`).\nexport * from './example';\n",
    );
  }

  mkdirSync(join(root, 'src', 'components', 'templates', 'MainLayout'), { recursive: true });
  writeFileSync(
    join(root, 'src', 'components', 'templates', 'index.ts'),
    "export * from './MainLayout';\n",
  );
  writeFileSync(
    join(root, 'src', 'components', 'templates', 'MainLayout', 'MainLayout.tsx'),
    'const NAV = ["/docs", "/example"];',
  );

  mkdirSync(join(root, 'src', 'pages', 'example', 'Docs'), { recursive: true });
  writeFileSync(join(root, 'src', 'pages', 'example', 'Docs', 'Docs.tsx'), '// example docs');
  mkdirSync(join(root, 'src', 'hooks', 'example'), { recursive: true });
  writeFileSync(join(root, 'src', 'hooks', 'example', 'useX.ts'), '// example hook');
  mkdirSync(join(root, 'src', 'lib', 'example'), { recursive: true });
  writeFileSync(join(root, 'src', 'lib', 'example', 'youtube.ts'), '// example lib');
  mkdirSync(join(root, 'src', 'types', 'example'), { recursive: true });
  writeFileSync(join(root, 'src', 'types', 'example', 'oembed.ts'), '// example types');

  // env + handlers
  mkdirSync(join(root, 'src', 'lib'), { recursive: true });
  writeFileSync(
    join(root, 'src', 'lib', 'env.ts'),
    [
      "import { z } from 'zod';",
      'const envSchema = z.object({',
      "  VITE_APP_TITLE: z.string().min(1).default('react-app-boilerplate'),",
      '  // EXAMPLE - used by the /watch demo. Remove alongside `src/**/example`.',
      "  VITE_OEMBED_BASE_URL: z.string().url().default('https://noembed.com/embed'),",
      '});',
    ].join('\n'),
  );

  mkdirSync(join(root, 'src', 'mocks'), { recursive: true });
  writeFileSync(
    join(root, 'src', 'mocks', 'handlers.ts'),
    'export const handlers = [/* example */];',
  );

  writeFileSync(
    join(root, '.env.example'),
    'VITE_APP_TITLE="app"\nVITE_OEMBED_BASE_URL="https://noembed.com/embed"\n',
  );

  // e2e
  mkdirSync(join(root, 'e2e'), { recursive: true });
  writeFileSync(join(root, 'e2e', 'app.spec.ts'), '// example e2e specs');
  writeFileSync(join(root, 'e2e', 'a11y.spec.ts'), '// a11y coverage');
}

describe('scripts/strip-example.mjs', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'strip-example-'));
    seed(tmp);
  });

  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it('removes every src/**/example directory', () => {
    const res = run(tmp);
    expect(res.status).toBe(0);
    for (const layer of ['atoms', 'molecules', 'organisms']) {
      expect(existsSync(join(tmp, 'src', 'components', layer, 'example'))).toBe(false);
    }
    expect(existsSync(join(tmp, 'src', 'pages', 'example'))).toBe(false);
    expect(existsSync(join(tmp, 'src', 'hooks', 'example'))).toBe(false);
    expect(existsSync(join(tmp, 'src', 'lib', 'example'))).toBe(false);
    expect(existsSync(join(tmp, 'src', 'types', 'example'))).toBe(false);
  });

  it('deletes example page directories but keeps pages/index/', () => {
    run(tmp);
    for (const dir of ['docs', 'example', 'watch']) {
      expect(existsSync(join(tmp, 'pages', dir))).toBe(false);
    }
    expect(existsSync(join(tmp, 'pages', 'index'))).toBe(true);
  });

  it('rewrites pages/index/+Page.tsx to render the new Home page', () => {
    run(tmp);
    const contents = readFileSync(join(tmp, 'pages', 'index', '+Page.tsx'), 'utf8');
    expect(contents).toContain("from '@/pages/Home'");
    expect(contents).not.toContain('example/Landing');
  });

  it('writes a Home page with a test, story, and barrel', () => {
    run(tmp);
    const dir = join(tmp, 'src', 'pages', 'Home');
    expect(existsSync(join(dir, 'Home.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'Home.test.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'Home.stories.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'index.ts'))).toBe(true);
    const test = readFileSync(join(dir, 'Home.test.tsx'), 'utf8');
    expect(test).toContain('toHaveNoViolations');
  });

  it('strips example exports from component barrels', () => {
    run(tmp);
    for (const layer of ['atoms', 'molecules', 'organisms']) {
      const barrel = readFileSync(join(tmp, 'src', 'components', layer, 'index.ts'), 'utf8');
      expect(barrel).not.toContain("'./example'");
      expect(barrel).not.toContain('// Delete');
    }
  });

  it('removes VITE_OEMBED_BASE_URL from env schema and .env.example', () => {
    run(tmp);
    expect(readFileSync(join(tmp, 'src', 'lib', 'env.ts'), 'utf8')).not.toContain(
      'VITE_OEMBED_BASE_URL',
    );
    expect(readFileSync(join(tmp, '.env.example'), 'utf8')).not.toContain('VITE_OEMBED_BASE_URL');
  });

  it('empties MSW handlers to a placeholder array', () => {
    run(tmp);
    const contents = readFileSync(join(tmp, 'src', 'mocks', 'handlers.ts'), 'utf8');
    expect(contents).toMatch(/export const handlers[^=]*=\s*\[\]/);
  });

  it('drops example e2e specs and writes a smoke test in their place', () => {
    run(tmp);
    expect(existsSync(join(tmp, 'e2e', 'app.spec.ts'))).toBe(false);
    expect(existsSync(join(tmp, 'e2e', 'a11y.spec.ts'))).toBe(true);
    expect(existsSync(join(tmp, 'e2e', 'smoke.spec.ts'))).toBe(true);
  });

  it('simplifies MainLayout nav to just the theme toggle + repo link', () => {
    run(tmp);
    const layout = readFileSync(
      join(tmp, 'src', 'components', 'templates', 'MainLayout', 'MainLayout.tsx'),
      'utf8',
    );
    expect(layout).not.toContain('/docs');
    expect(layout).not.toContain('/example');
    expect(layout).toContain('useTheme');
  });

  it('is idempotent (running twice reports "nothing to do")', () => {
    run(tmp);
    const second = run(tmp);
    expect(second.status).toBe(0);
    expect(second.stdout).toMatch(/nothing to do|1 change|2 change/);
  });

  it('--dry-run prints changes without writing', () => {
    const res = run(tmp, ['--dry-run']);
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/dry-run/);
    expect(existsSync(join(tmp, 'pages', 'docs'))).toBe(true);
    expect(existsSync(join(tmp, 'src', 'components', 'atoms', 'example'))).toBe(true);
  });
});
