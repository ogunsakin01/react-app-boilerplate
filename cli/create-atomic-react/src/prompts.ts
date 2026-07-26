import * as p from '@clack/prompts';
import type { PackageManager } from './args.js';

const CANCEL_MSG = '__cancel__';

function unwrap<T>(value: T | symbol): T {
  if (p.isCancel(value)) throw new Error(CANCEL_MSG);
  return value as T;
}

export function isCancelError(err: unknown): boolean {
  return err instanceof Error && err.message === CANCEL_MSG;
}

export async function promptProjectName(defaultName = 'my-app'): Promise<string> {
  return unwrap(
    await p.text({
      message: 'Project name? (use "." to scaffold into the current directory)',
      initialValue: defaultName,
      validate: (v) => {
        if (!v || v.length === 0) return 'Name is required.';
        if (v === '.') return; // sentinel. handled by scaffold
        if (!/^[a-z0-9][a-z0-9-_]*$/i.test(v)) {
          return 'Use letters, numbers, dash, or underscore (must start with a letter or number).';
        }
      },
    }),
  );
}

export async function promptPackageManager(detected: PackageManager): Promise<PackageManager> {
  return unwrap(
    await p.select<PackageManager>({
      message: 'Package manager?',
      options: [
        { value: 'pnpm', label: 'pnpm' },
        { value: 'npm', label: 'npm' },
        { value: 'yarn', label: 'yarn' },
      ],
      initialValue: detected,
    }),
  );
}

export async function promptConfirm(message: string, initialValue = true): Promise<boolean> {
  return unwrap(await p.confirm({ message, initialValue }));
}
