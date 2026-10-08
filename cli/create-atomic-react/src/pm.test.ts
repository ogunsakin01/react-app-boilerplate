import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { adaptToPackageManager, rewritePnpmCommand } from './pm.js';

const WORKFLOW = `jobs:
  ci:
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Format check
        run: pnpm exec prettier --check .

      - name: Test
        run: pnpm test:coverage
`;

describe('rewritePnpmCommand', () => {
  it.each([
    ['pnpm exec lint-staged', 'npm', 'npx --no -- lint-staged'],
    ['pnpm exec commitlint --edit "$1"', 'npm', 'npx --no -- commitlint --edit "$1"'],
    ['pnpm install --frozen-lockfile', 'npm', 'npm ci'],
    ['pnpm dev:app', 'npm', 'npm run dev:app'],
    ['pnpm exec lint-staged', 'yarn', 'yarn lint-staged'],
    ['pnpm install --frozen-lockfile', 'yarn', 'yarn install --frozen-lockfile'],
    ['pnpm build', 'yarn', 'yarn build'],
  ] as const)('%s (%s) -> %s', (input, pm, expected) => {
    expect(rewritePnpmCommand(input, pm)).toBe(expected);
  });

  it('leaves pnpm commands alone for pnpm', () => {
    expect(rewritePnpmCommand('pnpm exec lint-staged', 'pnpm')).toBe('pnpm exec lint-staged');
  });
});

describe('adaptToPackageManager', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'atomic-react-'));
    await mkdir(join(dir, '.husky'));
    await mkdir(join(dir, '.github/workflows'), { recursive: true });
    await mkdir(join(dir, 'e2e'));
    await writeFile(join(dir, '.husky/pre-commit'), 'pnpm exec lint-staged\n');
    await writeFile(join(dir, '.husky/commit-msg'), 'pnpm exec commitlint --edit "$1"\n');
    await writeFile(join(dir, '.github/workflows/ci.yml'), WORKFLOW);
    await writeFile(join(dir, 'e2e/playwright.config.ts'), "webServerCommand: 'pnpm dev:app',\n");
    await writeFile(join(dir, 'netlify.toml'), '[build]\n  command = "pnpm build"\n');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('rewrites hooks, CI, the e2e server and netlify for npm', async () => {
    await adaptToPackageManager(dir, 'npm');

    expect(await readFile(join(dir, '.husky/pre-commit'), 'utf8')).toBe(
      'npx --no -- lint-staged\n',
    );
    const ci = await readFile(join(dir, '.github/workflows/ci.yml'), 'utf8');
    expect(ci).not.toMatch(/pnpm/);
    expect(ci).toContain('cache: npm');
    expect(ci).toContain('run: npm ci');
    expect(ci).toContain('run: npx --no -- prettier --check .');
    expect(ci).toContain('run: npm run test:coverage');
    expect(ci).toContain(
      '      - name: Checkout\n        uses: actions/checkout@v4\n\n      - name: Setup Node',
    );
    expect(await readFile(join(dir, 'e2e/playwright.config.ts'), 'utf8')).toContain(
      "webServerCommand: 'npm run dev:app'",
    );
    expect(await readFile(join(dir, 'netlify.toml'), 'utf8')).toContain(
      'command = "npm run build"',
    );
  });

  it('leaves everything untouched for pnpm', async () => {
    await adaptToPackageManager(dir, 'pnpm');

    expect(await readFile(join(dir, '.github/workflows/ci.yml'), 'utf8')).toBe(WORKFLOW);
  });
});
