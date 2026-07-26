// Copies templates/react-ts/ into cli/create-atomic-react/templates/react-ts/
// so the CLI ships with the template embedded, and rewrites `workspace:*` deps
// to real versions from the monorepo's packages/*.
import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, '../../../templates/react-ts');
const DEST = resolve(HERE, '../templates/react-ts');
const PACKAGES_DIR = resolve(HERE, '../../../packages');

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

await rm(resolve(HERE, '../templates'), { recursive: true, force: true });

await cp(SRC, DEST, {
  recursive: true,
  filter: (path) => !SKIP.test(path.slice(SRC.length)),
});

const pkgPath = join(DEST, 'package.json');
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

console.log(`Synced template: ${SRC} → ${DEST}`);
console.log(`Rewrote workspace refs for ${Object.keys(versions).length} packages.`);
