import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { PackageManager } from './args.js';

interface PmCommands {
  install: string;
  ciInstall: string;
  run: (script: string) => string;
  exec: (bin: string) => string;
  cache: string;
}

const COMMANDS: Record<Exclude<PackageManager, 'pnpm'>, PmCommands> = {
  npm: {
    install: 'npm install',
    ciInstall: 'npm ci',
    run: (script) => `npm run ${script}`,
    exec: (bin) => `npx --no -- ${bin}`,
    cache: 'npm',
  },
  yarn: {
    install: 'yarn install',
    ciInstall: 'yarn install --frozen-lockfile',
    run: (script) => `yarn ${script}`,
    exec: (bin) => `yarn ${bin}`,
    cache: 'yarn',
  },
};

// Rewrites a command string written for pnpm. Order matters: `pnpm exec` and
// `pnpm install --frozen-lockfile` must be handled before the generic
// `pnpm <script>` rule.
export function rewritePnpmCommand(text: string, pm: PackageManager): string {
  if (pm === 'pnpm') return text;
  const c = COMMANDS[pm];
  return text
    .replace(/pnpm install --frozen-lockfile/g, c.ciInstall)
    .replace(/pnpm install/g, c.install)
    .replace(/pnpm exec ([\w@/.-]+)/g, (_, bin: string) => c.exec(bin))
    .replace(/pnpm ([\w:-]+)/g, (_, script: string) => c.run(script));
}

function rewriteWorkflow(yaml: string, pm: Exclude<PackageManager, 'pnpm'>): string {
  const withoutPnpmSetup = yaml.replace(
    /\n {6}- name: Setup pnpm\n {8}uses: pnpm\/action-setup@[^\n]+\n(?: {8}with:\n(?: {10}[^\n]+\n)+)?/g,
    '\n',
  );
  const run = withoutPnpmSetup
    .replace(/cache: pnpm/g, `cache: ${COMMANDS[pm].cache}`)
    .replace(
      /^(\s+run: )(.+)$/gm,
      (_, prefix: string, cmd: string) => prefix + rewritePnpmCommand(cmd, pm),
    );
  return run.replace(/\n{3,}/g, '\n\n');
}

async function rewriteFile(
  targetDir: string,
  rel: string,
  fn: (text: string) => string,
): Promise<void> {
  const path = resolve(targetDir, rel);
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw err;
  }
  const next = fn(text);
  if (next !== text) await writeFile(path, next);
}

// Templates are written for pnpm. Hooks, CI and the e2e/netlify build commands
// call pnpm directly, so an npm or yarn scaffold would fail on its first commit
// or first CI run without this.
export async function adaptToPackageManager(targetDir: string, pm: PackageManager): Promise<void> {
  if (pm === 'pnpm') return;
  const command = (text: string) => rewritePnpmCommand(text, pm);

  await rewriteFile(targetDir, '.husky/pre-commit', command);
  await rewriteFile(targetDir, '.husky/commit-msg', command);
  await rewriteFile(targetDir, '.github/workflows/ci.yml', (y) => rewriteWorkflow(y, pm));
  await rewriteFile(targetDir, '.github/workflows/e2e.yml', (y) => rewriteWorkflow(y, pm));
  await rewriteFile(targetDir, 'e2e/playwright.config.ts', (ts) =>
    ts.replace(
      /\b(webServerCommand|command): '([^']+)'/g,
      (_, key: string, cmd: string) => `${key}: '${command(cmd)}'`,
    ),
  );
  await rewriteFile(targetDir, 'netlify.toml', (toml) =>
    toml.replace(/command = "([^"]+)"/, (_, cmd: string) => `command = "${command(cmd)}"`),
  );
}
