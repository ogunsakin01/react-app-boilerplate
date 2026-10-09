// Copies templates/{variant}/ into cli/create-atomic-react/templates/{variant}/
// so the CLI ships with each template embedded, and rewrites `workspace:*` deps
// to real versions from the monorepo's packages/*.
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_SRC = resolve(HERE, '../../../templates');
const TEMPLATES_DEST = resolve(HERE, '../templates');
const PACKAGES_DIR = resolve(HERE, '../../../packages');

const VARIANTS = ['react-ts', 'react-ts-ssr'];

// Fallback filter for when git isn't available. Matched against whole path
// segments so files like `distance.ts` survive.
const SKIP =
  /(?:^|[\\/])(?:node_modules|\.turbo|\.tanstack|coverage|dist|storybook-static|playwright-report|test-results|\.vite)(?:[\\/]|$)|\.tsbuildinfo$/;

// Ship exactly what's committed, so an untracked local file (.env.local, a
// scratch component) can never end up in the published package.
function trackedFiles(dir) {
  try {
    const out = execFileSync('git', ['ls-files', '-z', '--cached', '--', '.'], {
      cwd: dir,
      encoding: 'utf8',
    });
    return out.split('\0').filter(Boolean);
  } catch {
    return null;
  }
}

async function copyTracked(src, dest) {
  const files = trackedFiles(src);
  if (!files) {
    await cp(src, dest, { recursive: true, filter: (path) => !SKIP.test(path.slice(src.length)) });
    return;
  }
  for (const rel of files) {
    const to = join(dest, rel);
    await mkdir(dirname(to), { recursive: true });
    try {
      await cp(join(src, rel), to);
    } catch (err) {
      // Tracked but deleted in the working tree: skip, the release build runs from a clean checkout.
      if (err.code !== 'ENOENT') throw err;
    }
  }
}

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

  await copyTracked(src, dest);

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

  // npm strips .gitignore from published tarballs; copy.ts renames it back.
  await rename(join(dest, '.gitignore'), join(dest, '_gitignore'));

  console.log(`Synced template: ${src} → ${dest}`);
}

console.log(`Rewrote workspace refs for ${Object.keys(versions).length} packages.`);
