import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { restoreGitignore } from './copy.js';

const TEMPLATE = 'node_modules\ndist\n.env\n.env.*\n!.env.example\n';

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

describe('restoreGitignore', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'atomic-react-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('renames _gitignore to .gitignore in a fresh project', async () => {
    await writeFile(join(dir, '_gitignore'), TEMPLATE);

    await restoreGitignore(dir);

    expect(await readFile(join(dir, '.gitignore'), 'utf8')).toBe(TEMPLATE);
    expect(await exists(join(dir, '_gitignore'))).toBe(false);
  });

  it('appends only missing entries to an existing .gitignore', async () => {
    await writeFile(join(dir, '_gitignore'), TEMPLATE);
    await writeFile(join(dir, '.gitignore'), '.idea\nnode_modules');

    await restoreGitignore(dir);

    const result = await readFile(join(dir, '.gitignore'), 'utf8');
    expect(result).toBe(
      '.idea\nnode_modules\n\n# Added by create-atomic-react\ndist\n.env\n.env.*\n!.env.example\n',
    );
    expect(await exists(join(dir, '_gitignore'))).toBe(false);
  });

  it('leaves an existing .gitignore untouched when it already covers everything', async () => {
    await writeFile(join(dir, '_gitignore'), TEMPLATE);
    await writeFile(join(dir, '.gitignore'), TEMPLATE);

    await restoreGitignore(dir);

    expect(await readFile(join(dir, '.gitignore'), 'utf8')).toBe(TEMPLATE);
    expect(await exists(join(dir, '_gitignore'))).toBe(false);
  });

  it('does nothing when the template ships no _gitignore', async () => {
    await restoreGitignore(dir);

    expect(await exists(join(dir, '.gitignore'))).toBe(false);
  });
});
