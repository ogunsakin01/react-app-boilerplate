import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appendAgentsNote, applyMuiAddon, applyReactAriaAddon, registerAtom } from './addons.js';

const AGENTS = '# AGENTS.md\n\nBase guidance.\n';

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

describe('addons', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'atomic-react-'));
    await writeFile(join(dir, 'package.json'), JSON.stringify({ dependencies: {} }));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  describe('appendAgentsNote', () => {
    it('appends the section after a blank line', async () => {
      await writeFile(join(dir, 'AGENTS.md'), AGENTS);

      await appendAgentsNote(dir, '## Extra\n\n- note\n');

      expect(await readFile(join(dir, 'AGENTS.md'), 'utf8')).toBe(
        '# AGENTS.md\n\nBase guidance.\n\n## Extra\n\n- note\n',
      );
    });

    it('does not create AGENTS.md when the project has none', async () => {
      await appendAgentsNote(dir, '## Extra');

      expect(await exists(join(dir, 'AGENTS.md'))).toBe(false);
    });
  });

  it('--mui documents the MuiButton wrapper in AGENTS.md', async () => {
    await writeFile(join(dir, 'AGENTS.md'), AGENTS);

    await applyMuiAddon(dir);

    const agents = await readFile(join(dir, 'AGENTS.md'), 'utf8');
    expect(agents).toContain('## Material UI (added by --mui)');
    expect(agents).toContain('src/components/atoms/MuiButton/');
    expect(await exists(join(dir, 'src/components/atoms/MuiButton/MuiButton.tsx'))).toBe(true);
  });

  it('--react-aria documents the AriaButton wrapper in AGENTS.md', async () => {
    await writeFile(join(dir, 'AGENTS.md'), AGENTS);

    await applyReactAriaAddon(dir);

    const agents = await readFile(join(dir, 'AGENTS.md'), 'utf8');
    expect(agents).toContain('## React Aria Components (added by --react-aria)');
    expect(agents).toContain('src/components/atoms/AriaButton/');
  });

  it('both addons stack their sections in order', async () => {
    await writeFile(join(dir, 'AGENTS.md'), AGENTS);

    await applyMuiAddon(dir);
    await applyReactAriaAddon(dir);

    const agents = await readFile(join(dir, 'AGENTS.md'), 'utf8');
    expect(agents.indexOf('## Material UI')).toBeLessThan(agents.indexOf('## React Aria'));
    expect(agents.endsWith('\n')).toBe(true);
  });

  describe('registerAtom', () => {
    const BARREL =
      "export * from './Button';\n// Delete the following line when you remove the example (`src/**/example`).\nexport * from './example';\n";

    it('adds the atom above the example re-export, once', async () => {
      await mkdir(join(dir, 'src/components/atoms'), { recursive: true });
      await writeFile(join(dir, 'src/components/atoms/index.ts'), BARREL);

      await registerAtom(dir, 'MuiButton');
      await registerAtom(dir, 'MuiButton');

      expect(await readFile(join(dir, 'src/components/atoms/index.ts'), 'utf8')).toBe(
        "export * from './Button';\nexport * from './MuiButton';\n// Delete the following line when you remove the example (`src/**/example`).\nexport * from './example';\n",
      );
    });
  });

  it('--mui barrel exports the Props type', async () => {
    await applyMuiAddon(dir);

    expect(await readFile(join(dir, 'src/components/atoms/MuiButton/index.ts'), 'utf8')).toContain(
      "export type { MuiButtonProps } from './MuiButton';",
    );
  });
});
