import { cp, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TemplateVariant } from './args.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_ROOT = resolve(HERE, '../templates');

const SKIP =
  /(?:node_modules|\.turbo|\.tanstack|coverage|dist|storybook-static|playwright-report|test-results|\.vite|\.tsbuildinfo)/;

export function templateRoot(variant: TemplateVariant): string {
  return resolve(TEMPLATES_ROOT, variant);
}

export async function copyTemplate(
  targetDir: string,
  variant: TemplateVariant = 'react-ts',
): Promise<void> {
  const src = templateRoot(variant);
  await cp(src, targetDir, {
    recursive: true,
    filter: (path) => !SKIP.test(path.slice(src.length)),
  });
}

export async function renameProject(targetDir: string, projectName: string): Promise<void> {
  const pkgPath = resolve(targetDir, 'package.json');
  const raw = await readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(raw);

  pkg.name = projectName;
  pkg.version = '0.0.0';
  pkg.private = true;
  delete pkg.publishConfig;
  delete pkg.msw;

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}
