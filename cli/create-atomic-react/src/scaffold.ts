import { mkdir, readdir, stat } from 'node:fs/promises';
import { basename, relative, resolve } from 'node:path';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import type { CliArgs } from './args.js';
import { copyTemplate, renameProject } from './copy.js';
import { detectPackageManager } from './detect.js';
import { runGitInit, runInstall } from './install.js';
import { promptConfirm, promptPackageManager, promptProjectName } from './prompts.js';

// Anything else in a target-is-cwd scaffold blocks the operation.
const SAFE_EXISTING = new Set([
  '.git',
  '.gitignore',
  '.gitattributes',
  '.idea',
  '.vscode',
  '.DS_Store',
  'LICENSE',
  'LICENSE.md',
  'README.md',
]);

async function dirExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw err;
  }
}

async function isEmptyEnough(path: string): Promise<{ ok: boolean; blockers: string[] }> {
  const entries = await readdir(path);
  const blockers = entries.filter((e) => !SAFE_EXISTING.has(e));
  return { ok: blockers.length === 0, blockers };
}

function isValidPackageName(name: string): boolean {
  return /^[a-z0-9][a-z0-9-_]*$/i.test(name);
}

export async function runScaffold(args: CliArgs): Promise<void> {
  const detected = detectPackageManager();

  const rawTarget = args.projectName ?? (args.yes ? 'my-app' : await promptProjectName());
  const scaffoldInPlace = rawTarget === '.';

  const targetDir = scaffoldInPlace ? process.cwd() : resolve(process.cwd(), rawTarget);

  const projectName = scaffoldInPlace ? basename(targetDir) : rawTarget;

  if (!isValidPackageName(projectName)) {
    throw new Error(
      `Invalid package name derived: ${pc.bold(projectName)}. ` +
        `Use letters, numbers, dash, or underscore (must start with a letter or number).`,
    );
  }

  if (scaffoldInPlace) {
    const { ok, blockers } = await isEmptyEnough(targetDir);
    if (!ok) {
      throw new Error(
        `Current directory is not empty. Blocking files/folders: ${blockers.slice(0, 5).join(', ')}${
          blockers.length > 5 ? '…' : ''
        }.\n  Move them, or scaffold into a fresh subfolder: ` +
          pc.cyan('create-atomic-react my-app'),
      );
    }
  } else if (await dirExists(targetDir)) {
    throw new Error(`Directory ${pc.bold(rawTarget)} already exists.`);
  }

  const pm = args.pm ?? (args.yes ? detected : await promptPackageManager(detected));

  const doInstall =
    !args.yes && args.install ? await promptConfirm('Install dependencies?') : args.install;
  const doGit = !args.yes && args.git ? await promptConfirm('Initialize a git repo?') : args.git;

  const spinner = p.spinner();

  const variantLabel = args.variant === 'react-ts-ssr' ? ' (SSR / Vike)' : '';
  spinner.start(`Copying template${variantLabel}`);
  await mkdir(targetDir, { recursive: true });
  await copyTemplate(targetDir, args.variant);
  await renameProject(targetDir, projectName);
  spinner.stop(
    scaffoldInPlace
      ? `Template${variantLabel} copied → current directory (${pc.bold(projectName)})`
      : `Template${variantLabel} copied → ${pc.bold(relative(process.cwd(), targetDir))}`,
  );

  if (doGit) {
    spinner.start('Initializing git');
    if (scaffoldInPlace && (await dirExists(resolve(targetDir, '.git')))) {
      spinner.stop('Git repo already present, skipped init.');
    } else {
      await runGitInit(targetDir);
      spinner.stop('Git initialized.');
    }
  }

  if (doInstall) {
    spinner.start(`Running ${pm} install (this can take a minute)`);
    await runInstall(targetDir, pm);
    spinner.stop(`${pm} install complete.`);
  }

  p.outro(pc.green('Done!'));

  console.log('');
  console.log(pc.dim('  Next steps:'));
  if (!scaffoldInPlace) console.log(pc.dim(`    cd ${rawTarget}`));
  if (!doInstall) console.log(pc.dim(`    ${pm} install`));
  console.log(pc.dim(`    ${pm} run dev`));
  console.log('');
}
