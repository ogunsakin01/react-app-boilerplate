import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import type { InitArgs, PackageManager } from './args.js';
import { detectPackageManager } from './detect.js';
import { runAddDev } from './install.js';
import { promptConfirm, promptPackageManager } from './prompts.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ATOMIC_SCAFFOLD_SRC = resolve(HERE, '../templates/react-ts/src/components/atoms/Button');

const SHARED_PACKAGES = [
  '@react-app-boilerplate/eslint-config',
  '@react-app-boilerplate/tsconfig',
  '@react-app-boilerplate/vitest-config',
  '@react-app-boilerplate/playwright-config',
];

// Peer deps that consumers must install alongside a given shared config.
const PEER_DEPS: Record<string, string[]> = {
  '@react-app-boilerplate/eslint-config': ['eslint'],
  '@react-app-boilerplate/vitest-config': ['vitest', '@vitest/coverage-v8'],
  '@react-app-boilerplate/playwright-config': ['@playwright/test'],
};

const STUBS = {
  'eslint.config.mjs': `export { default } from '@react-app-boilerplate/eslint-config/vite-react';\n`,
  'tsconfig.app.json': `{
  "extends": "@react-app-boilerplate/tsconfig/vite-react.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
`,
  'tsconfig.node.json': `{
  "extends": "@react-app-boilerplate/tsconfig/node.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo"
  },
  "include": ["vite.config.ts"]
}
`,
  'tsconfig.json': `{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
`,
  'vite.config.ts': `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { vitestReactConfig } from '@react-app-boilerplate/vitest-config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: vitestReactConfig(),
});
`,
  'e2e/playwright.config.ts': `import { defineConfig } from '@playwright/test';
import { playwrightViteConfig } from '@react-app-boilerplate/playwright-config';

export default defineConfig(playwrightViteConfig());
`,
} as const;

// If any of these files exist, we skip the stub and print a manual instruction.
const CONFLICT_ALIASES: Record<keyof typeof STUBS, string[]> = {
  'eslint.config.mjs': [
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.cjs',
    'eslint.config.ts',
    '.eslintrc',
    '.eslintrc.js',
    '.eslintrc.json',
    '.eslintrc.cjs',
  ],
  'tsconfig.app.json': ['tsconfig.app.json'],
  'tsconfig.node.json': ['tsconfig.node.json'],
  'tsconfig.json': ['tsconfig.json'],
  'vite.config.ts': ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'],
  'e2e/playwright.config.ts': [
    'e2e/playwright.config.ts',
    'playwright.config.ts',
    'playwright.config.js',
  ],
};

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

interface Plan {
  toWrite: (keyof typeof STUBS)[];
  toSkip: { stub: keyof typeof STUBS; existing: string }[];
  writeComponents: boolean;
}

async function detectPlan(targetDir: string): Promise<Plan> {
  const toWrite: Plan['toWrite'] = [];
  const toSkip: Plan['toSkip'] = [];

  for (const stub of Object.keys(STUBS) as (keyof typeof STUBS)[]) {
    let conflict: string | undefined;
    for (const alias of CONFLICT_ALIASES[stub]) {
      if (await exists(join(targetDir, alias))) {
        conflict = alias;
        break;
      }
    }
    if (conflict) toSkip.push({ stub, existing: conflict });
    else toWrite.push(stub);
  }

  const writeComponents = !(await exists(join(targetDir, 'src/components')));

  return { toWrite, toSkip, writeComponents };
}

async function detectMissingPeers(pkgPath: string): Promise<string[]> {
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  const installed = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);
  const missing = new Set<string>();
  for (const peers of Object.values(PEER_DEPS)) {
    for (const peer of peers) if (!installed.has(peer)) missing.add(peer);
  }
  return [...missing];
}

async function copyComponentScaffold(targetDir: string): Promise<void> {
  const dest = join(targetDir, 'src/components');
  const buttonDest = join(dest, 'atoms/Button');
  await mkdir(buttonDest, { recursive: true });

  const buttonTsx = await readFile(join(ATOMIC_SCAFFOLD_SRC, 'Button.tsx'), 'utf8');
  const buttonIndex = await readFile(join(ATOMIC_SCAFFOLD_SRC, 'index.ts'), 'utf8');
  await writeFile(join(buttonDest, 'Button.tsx'), buttonTsx);
  await writeFile(join(buttonDest, 'index.ts'), buttonIndex);

  await writeFile(join(dest, 'atoms/index.ts'), `export * from './Button';\n`);
  const emptyBarrel = `// Empty barrel. Add your components here following the atomic convention.\nexport {};\n`;
  for (const layer of ['molecules', 'organisms', 'templates']) {
    await mkdir(join(dest, layer), { recursive: true });
    await writeFile(join(dest, layer, 'index.ts'), emptyBarrel);
  }
  await writeFile(
    join(dest, 'index.ts'),
    `export * from './atoms';\nexport * from './molecules';\nexport * from './organisms';\nexport * from './templates';\n`,
  );
}

function printPlan(plan: Plan, missingPeers: string[], packages: string[]): void {
  if (plan.toWrite.length) {
    console.log(pc.dim('  Will write:'));
    for (const stub of plan.toWrite) console.log(pc.green(`    + ${stub}`));
  }
  if (plan.toSkip.length) {
    console.log(pc.dim('  Will skip (already present, manual step below):'));
    for (const { stub, existing } of plan.toSkip) {
      console.log(pc.yellow(`    ~ ${stub}  (found ${existing})`));
    }
  }
  if (plan.writeComponents) {
    console.log(pc.dim('  Will copy atomic scaffold:'));
    console.log(pc.green(`    + src/components/{atoms,molecules,organisms,templates}/index.ts`));
    console.log(pc.green(`    + src/components/atoms/Button/{Button.tsx,index.ts}`));
  } else {
    console.log(pc.yellow(`    ~ src/components/  (already present, skipping)`));
  }
  console.log(pc.dim('  Will install (devDependencies):'));
  for (const pkg of [...packages, ...missingPeers]) console.log(pc.green(`    + ${pkg}`));
}

function printManualInstructions(plan: Plan): void {
  if (plan.toSkip.length === 0) return;
  console.log('');
  console.log(pc.bold('Manual steps for skipped files:'));

  const hints: Record<string, string> = {
    'eslint.config.mjs': `In your existing ESLint config, extend the shared config:
    import config from '@react-app-boilerplate/eslint-config/vite-react';
    export default [...config, /* your overrides */];`,
    'tsconfig.app.json': `Add "extends": "@react-app-boilerplate/tsconfig/vite-react.json" to your tsconfig.app.json.`,
    'tsconfig.node.json': `Add "extends": "@react-app-boilerplate/tsconfig/node.json" to your tsconfig.node.json.`,
    'tsconfig.json': `No action needed. Your existing tsconfig.json is left as-is.`,
    'vite.config.ts': `Add the shared Vitest config to your vite.config.ts:
    import { vitestReactConfig } from '@react-app-boilerplate/vitest-config';
    // in defineConfig({ ..., test: vitestReactConfig() })`,
    'e2e/playwright.config.ts': `Wrap your Playwright config with the shared factory:
    import { playwrightViteConfig } from '@react-app-boilerplate/playwright-config';
    export default defineConfig(playwrightViteConfig());`,
  };

  for (const { stub } of plan.toSkip) {
    console.log('');
    console.log(pc.yellow(`  ~ ${stub}`));
    console.log(pc.dim('    ' + (hints[stub] ?? 'Review manually.')));
  }
}

async function writeStubs(targetDir: string, plan: Plan): Promise<void> {
  for (const stub of plan.toWrite) {
    const path = join(targetDir, stub);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, STUBS[stub]);
  }
}

export async function runInit(argv: string[]): Promise<void> {
  const { parseInitArgs } = await import('./args.js');
  const args: InitArgs = parseInitArgs(argv);

  if (args.help) {
    const { HELP } = await import('./args.js');
    console.log(HELP);
    return;
  }

  const targetDir = resolve(process.cwd(), args.dir ?? '.');
  const pkgPath = join(targetDir, 'package.json');

  if (!(await exists(pkgPath))) {
    throw new Error(
      `No package.json found in ${targetDir}. Run \`init\` inside an existing project (or scaffold a new one instead).`,
    );
  }

  p.intro(pc.bgCyan(pc.black(' create-atomic-react init ')));

  const plan = await detectPlan(targetDir);
  const missingPeers = await detectMissingPeers(pkgPath);

  console.log('');
  console.log(pc.bold(`Target: ${targetDir}`));
  console.log('');
  printPlan(plan, missingPeers, SHARED_PACKAGES);
  console.log('');

  if (!args.yes) {
    const ok = await promptConfirm('Proceed?');
    if (!ok) {
      p.cancel('Cancelled.');
      return;
    }
  }

  const detected = detectPackageManager();
  const pm: PackageManager =
    args.pm ?? (args.yes ? detected : await promptPackageManager(detected));

  const spinner = p.spinner();

  spinner.start('Writing config stubs');
  await writeStubs(targetDir, plan);
  spinner.stop(`Wrote ${plan.toWrite.length} config stub(s).`);

  if (plan.writeComponents) {
    spinner.start('Copying atomic scaffold');
    await copyComponentScaffold(targetDir);
    spinner.stop('Copied src/components/ scaffold.');
  }

  if (args.install) {
    const packages = [...SHARED_PACKAGES, ...missingPeers];
    spinner.start(`Installing with ${pm} (${packages.length} packages)`);
    await runAddDev(targetDir, pm, packages);
    spinner.stop(`${pm} added ${packages.length} package(s).`);
  }

  p.outro(pc.green('init complete.'));
  printManualInstructions(plan);
}
