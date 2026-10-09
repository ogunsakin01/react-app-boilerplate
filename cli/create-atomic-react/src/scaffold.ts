import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import { basename, relative, resolve } from 'node:path';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { applyMuiAddon, applyReactAriaAddon } from './addons.js';
import type { CliArgs } from './args.js';
import { copyTemplate, renameProject } from './copy.js';
import { detectPackageManager } from './detect.js';
import { runGitInit, runInstall } from './install.js';
import { toPackageName } from './name.js';
import { adaptToPackageManager } from './pm.js';
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

// Resolves to false when the project was created but git init or install
// failed, so scripted runs can tell from the exit code.
export async function runScaffold(args: CliArgs): Promise<boolean> {
  const detected = detectPackageManager();

  const rawTarget = args.projectName ?? (args.yes ? 'my-app' : await promptProjectName());
  const scaffoldInPlace = rawTarget === '.';

  const targetDir = scaffoldInPlace ? process.cwd() : resolve(process.cwd(), rawTarget);

  const projectName = toPackageName(basename(targetDir));

  if (!projectName) {
    throw new Error(
      `Can't derive a package name from ${pc.bold(basename(targetDir))}. ` +
        `Use a folder name with at least one letter or number.`,
    );
  }
  if (projectName !== basename(targetDir)) {
    p.log.info(`Package name: ${pc.bold(projectName)} (npm names must be lowercase, URL-safe)`);
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

  const wantMui = args.yes
    ? args.mui
    : args.mui || (await promptConfirm('Add Material UI (@mui/material)?', false));
  const wantReactAria = args.yes
    ? args.reactAria
    : args.reactAria || (await promptConfirm('Add React Aria Components?', false));

  const doInstall =
    !args.yes && args.install ? await promptConfirm('Install dependencies?') : args.install;
  const doGit = !args.yes && args.git ? await promptConfirm('Initialize a git repo?') : args.git;

  const spinner = p.spinner();

  const variantLabel = args.variant === 'react-ts-ssr' ? ' (SSR / Vike)' : '';
  spinner.start(`Copying template${variantLabel}`);
  try {
    await mkdir(targetDir, { recursive: true });
    await copyTemplate(targetDir, args.variant, { overwrite: !scaffoldInPlace });
    await renameProject(targetDir, projectName);
    await adaptToPackageManager(targetDir, pm);
    if (wantMui) await applyMuiAddon(targetDir);
    if (wantReactAria) await applyReactAriaAddon(targetDir);
  } catch (err) {
    spinner.stop(`Copying template${variantLabel} failed.`, 1);
    // Only remove what this run created; never touch a pre-existing folder.
    if (!scaffoldInPlace) await rm(targetDir, { recursive: true, force: true });
    throw err;
  }
  spinner.stop(
    scaffoldInPlace
      ? `Template${variantLabel} copied → current directory (${pc.bold(projectName)})`
      : `Template${variantLabel} copied → ${pc.bold(relative(process.cwd(), targetDir))}`,
  );
  if (wantMui) p.log.success('Material UI added (src/components/atoms/MuiButton).');
  if (wantReactAria) p.log.success('React Aria added (src/components/atoms/AriaButton).');

  // From here on the project exists, so failures warn and print a recovery
  // step instead of aborting.
  const pending: string[] = [];

  if (doGit) {
    if (scaffoldInPlace && (await dirExists(resolve(targetDir, '.git')))) {
      p.log.info('Git repo already present, skipped init.');
    } else {
      try {
        await runGitInit(targetDir);
        p.log.success('Git initialized.');
      } catch (err) {
        p.log.warn(`git init failed (${err instanceof Error ? err.message : String(err)}).`);
        pending.push('git init');
      }
    }
  }

  let installed = false;
  if (doInstall) {
    // No spinner here: the package manager writes its own progress to the
    // same terminal.
    p.log.step(`Running ${pm} install (this can take a minute)`);
    try {
      await runInstall(targetDir, pm);
      installed = true;
      p.log.success(`${pm} install complete.`);
    } catch (err) {
      p.log.warn(`${pm} install failed (${err instanceof Error ? err.message : String(err)}).`);
    }
  }
  if (!installed) pending.push(`${pm} install`);

  p.outro(
    pc.green(installed || !doInstall ? 'Done!' : 'Project created - finish the steps below.'),
  );

  console.log('');
  console.log(pc.dim('  Next steps:'));
  if (!scaffoldInPlace) console.log(pc.dim(`    cd ${relative(process.cwd(), targetDir)}`));
  for (const step of pending) console.log(pc.dim(`    ${step}`));
  console.log(pc.dim(`    ${pm} run dev`));
  console.log('');
  return !pending.some((step) => step === 'git init') && (installed || !doInstall);
}
