// Copies templates/{variant}/ into cli/create-atomic-react/templates/{variant}/
// so the CLI ships with each template embedded, and rewrites `workspace:*` deps
// to real versions from the monorepo's packages/*.
import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_SRC = resolve(HERE, '../../../templates');
const TEMPLATES_DEST = resolve(HERE, '../templates');
const PACKAGES_DIR = resolve(HERE, '../../../packages');

const VARIANTS = ['react-ts', 'react-ts-ssr'];

const SKIP =
  /(?:node_modules|\.turbo|\.tanstack|coverage|dist|storybook-static|playwright-report|test-results|\.vite|\.tsbuildinfo)/;

const versions = {};
for (const dir of await readdir(PACKAGES_DIR)) {
  try {
    const pkg = JSON.parse(await readFile(join(PACKAGES_DIR, dir, 'package.json'), 'utf8'));
    versions[pkg.name] = pkg.version;
  } catch {
    // skip missing package.json
  }
}

await rm(TEMPLATES_DEST, { recursive: true, force: true });

for (const variant of VARIANTS) {
  const src = join(TEMPLATES_SRC, variant);
  const dest = join(TEMPLATES_DEST, variant);

  try {
    await readFile(join(src, 'package.json'));
  } catch {
    console.log(`Skipping ${variant}: source not found at ${src}`);
    continue;
  }

  await cp(src, dest, {
    recursive: true,
    filter: (path) => !SKIP.test(path.slice(src.length)),
  });

  const pkgPath = join(dest, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));

  for (const section of ['dependencies', 'devDependencies']) {
    const deps = pkg[section];
    if (!deps) continue;
    for (const [name, spec] of Object.entries(deps)) {
      if (typeof spec === 'string' && spec.startsWith('workspace:') && versions[name]) {
        deps[name] = `^${versions[name]}`;
      }
    }
  }

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  console.log(`Synced template: ${src} → ${dest}`);
}

console.log(`Rewrote workspace refs for ${Object.keys(versions).length} packages.`);
