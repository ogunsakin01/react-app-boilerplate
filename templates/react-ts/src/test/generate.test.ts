import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const SCRIPT = join(process.cwd(), 'scripts', 'generate.mjs');

function seedProject(root: string) {
  mkdirSync(join(root, 'src', 'components', 'atoms'), { recursive: true });
  mkdirSync(join(root, 'src', 'components', 'molecules'), { recursive: true });
  mkdirSync(join(root, 'src', 'components', 'organisms'), { recursive: true });
  mkdirSync(join(root, 'src', 'components', 'templates'), { recursive: true });
  mkdirSync(join(root, 'src', 'pages'), { recursive: true });
  mkdirSync(join(root, 'src', 'routes'), { recursive: true });
  mkdirSync(join(root, 'e2e'), { recursive: true });
}

function run(cwd: string, args: string[]) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8' });
}

describe('scripts/generate.mjs', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'generate-test-'));
    seedProject(tmp);
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it('creates an atom with all four files', () => {
    const res = run(tmp, ['--kind', 'atom', '--name', 'Badge']);
    expect(res.status).toBe(0);

    const dir = join(tmp, 'src', 'components', 'atoms', 'Badge');
    expect(existsSync(join(dir, 'Badge.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'Badge.test.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'Badge.stories.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'index.ts'))).toBe(true);
  });

  it('embeds an axe accessibility assertion in every generated test', () => {
    run(tmp, ['--kind', 'molecule', '--name', 'UserAvatar']);
    const test = readFileSync(
      join(tmp, 'src', 'components', 'molecules', 'UserAvatar', 'UserAvatar.test.tsx'),
      'utf8',
    );
    expect(test).toContain("import { axe } from 'jest-axe'");
    expect(test).toMatch(/toHaveNoViolations/);
  });

  it('titles the story with the correct atomic layer', () => {
    run(tmp, ['--kind', 'organism', '--name', 'UserProfile']);
    const story = readFileSync(
      join(tmp, 'src', 'components', 'organisms', 'UserProfile', 'UserProfile.stories.tsx'),
      'utf8',
    );
    expect(story).toContain("title: 'Organisms/UserProfile'");
  });

  it('writes a barrel that re-exports the component and its Props type', () => {
    run(tmp, ['--kind', 'atom', '--name', 'Chip']);
    const barrel = readFileSync(
      join(tmp, 'src', 'components', 'atoms', 'Chip', 'index.ts'),
      'utf8',
    );
    expect(barrel).toContain("export { Chip } from './Chip'");
    expect(barrel).toContain("export type { ChipProps } from './Chip'");
  });

  it('creates a page with route file and Playwright spec', () => {
    const res = run(tmp, ['--kind', 'page', '--name', 'Dashboard']);
    expect(res.status).toBe(0);

    expect(existsSync(join(tmp, 'src', 'pages', 'Dashboard', 'Dashboard.tsx'))).toBe(true);
    expect(existsSync(join(tmp, 'src', 'pages', 'Dashboard', 'Dashboard.test.tsx'))).toBe(true);
    expect(existsSync(join(tmp, 'src', 'pages', 'Dashboard', 'Dashboard.stories.tsx'))).toBe(true);
    expect(existsSync(join(tmp, 'src', 'pages', 'Dashboard', 'index.ts'))).toBe(true);
    expect(existsSync(join(tmp, 'src', 'routes', 'dashboard.tsx'))).toBe(true);
    expect(existsSync(join(tmp, 'e2e', 'Dashboard.spec.ts'))).toBe(true);
  });

  it('kebab-cases multi-word page names into the route slug', () => {
    run(tmp, ['--kind', 'page', '--name', 'UserSettings']);
    const route = readFileSync(join(tmp, 'src', 'routes', 'user-settings.tsx'), 'utf8');
    expect(route).toContain("createFileRoute('/user-settings')");
  });

  it('page barrel only exports the value (no Props type)', () => {
    run(tmp, ['--kind', 'page', '--name', 'Reports']);
    const barrel = readFileSync(join(tmp, 'src', 'pages', 'Reports', 'index.ts'), 'utf8');
    expect(barrel).toContain("export { Reports } from './Reports'");
    expect(barrel).not.toContain('ReportsProps');
  });

  it('page Playwright spec includes an axe scan of the route', () => {
    run(tmp, ['--kind', 'page', '--name', 'Analytics']);
    const spec = readFileSync(join(tmp, 'e2e', 'Analytics.spec.ts'), 'utf8');
    expect(spec).toContain("import AxeBuilder from '@axe-core/playwright'");
    expect(spec).toContain("await page.goto('/analytics')");
    expect(spec).toMatch(/violations.*toEqual\(\[\]\)/);
  });

  it('rejects a non-PascalCase name', () => {
    const res = run(tmp, ['--kind', 'atom', '--name', 'badge']);
    expect(res.status).not.toBe(0);
    expect(res.stdout + res.stderr).toMatch(/PascalCase/i);
  });

  it('rejects an unknown kind', () => {
    const res = run(tmp, ['--kind', 'widget', '--name', 'Foo']);
    expect(res.status).not.toBe(0);
    expect(res.stdout + res.stderr).toMatch(/atom|molecule|organism|template|page/i);
  });

  it('refuses to overwrite an existing target', () => {
    run(tmp, ['--kind', 'atom', '--name', 'Existing']);
    const res = run(tmp, ['--kind', 'atom', '--name', 'Existing']);
    expect(res.status).not.toBe(0);
    expect(res.stdout + res.stderr).toMatch(/already exists/i);
  });
});
