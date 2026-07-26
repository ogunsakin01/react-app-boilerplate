import { cp, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const TEMPLATE_ROOT = resolve(HERE, '../templates/react-ts');

const SKIP =
  /(?:node_modules|\.turbo|\.tanstack|coverage|dist|storybook-static|playwright-report|test-results|\.vite|\.tsbuildinfo)/;

export async function copyTemplate(targetDir: string): Promise<void> {
  await cp(TEMPLATE_ROOT, targetDir, {
    recursive: true,
    filter: (path) => !SKIP.test(path.slice(TEMPLATE_ROOT.length)),
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
