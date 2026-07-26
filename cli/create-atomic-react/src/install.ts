import { spawn } from 'node:child_process';
import type { PackageManager } from './args.js';

function run(cmd: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

export function runInstall(cwd: string, pm: PackageManager): Promise<void> {
  return run(pm, ['install'], cwd);
}

export function runAddDev(cwd: string, pm: PackageManager, packages: string[]): Promise<void> {
  if (packages.length === 0) return Promise.resolve();
  const args = {
    npm: ['install', '--save-dev', ...packages],
    pnpm: ['add', '-D', ...packages],
    yarn: ['add', '--dev', ...packages],
  }[pm];
  return run(pm, args, cwd);
}

export function runGitInit(cwd: string): Promise<void> {
  return run('git', ['init', '--quiet'], cwd);
}
