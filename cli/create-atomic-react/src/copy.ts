import { cp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TemplateVariant } from './args.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_ROOT = resolve(HERE, '../templates');

// Matched against whole path segments so files like `distance.ts` survive.
const SKIP =
  /(?:^|[\\/])(?:node_modules|\.turbo|\.tanstack|coverage|dist|storybook-static|playwright-report|test-results|\.vite)(?:[\\/]|$)|\.tsbuildinfo$/;

export function templateRoot(variant: TemplateVariant): string {
  return resolve(TEMPLATES_ROOT, variant);
}

// `overwrite: false` is for scaffolding into an existing folder: files already
// there (README.md, .vscode/settings.json, ...) are kept.
export async function copyTemplate(
  targetDir: string,
  variant: TemplateVariant = 'react-ts',
  { overwrite = true }: { overwrite?: boolean } = {},
): Promise<void> {
  const src = templateRoot(variant);
  await cp(src, targetDir, {
    recursive: true,
    force: overwrite,
    filter: (path) => !SKIP.test(path.slice(src.length)),
  });
  await restoreGitignore(targetDir);
}

// Templates ship `_gitignore` because npm strips `.gitignore` from tarballs.
// An existing `.gitignore` (scaffolding into `.`) gets the missing entries
// appended instead of being overwritten.
export async function restoreGitignore(targetDir: string): Promise<void> {
  const shipped = resolve(targetDir, '_gitignore');
  const target = resolve(targetDir, '.gitignore');

  let template: string;
  try {
    template = await readFile(shipped, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw err;
  }

  let existing: string;
  try {
    existing = await readFile(target, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    await rename(shipped, target);
    return;
  }

  const have = new Set(existing.split(/\r?\n/).map((line) => line.trim()));
  const missing = template
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.startsWith('#') && !have.has(line.trim()));
  if (missing.length > 0) {
    const sep = existing.endsWith('\n') || existing === '' ? '' : '\n';
    await writeFile(
      target,
      `${existing}${sep}\n# Added by create-atomic-react\n${missing.join('\n')}\n`,
    );
  }
  await rm(shipped);
}

export async function renameProject(targetDir: string, projectName: string): Promise<void> {
  const pkgPath = resolve(targetDir, 'package.json');
  const raw = await readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(raw);

  pkg.name = projectName;
  pkg.version = '0.0.0';
  pkg.private = true;
  delete pkg.publishConfig;

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}
