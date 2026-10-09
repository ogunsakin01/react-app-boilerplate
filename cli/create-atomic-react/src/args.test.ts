import { describe, expect, it } from 'vitest';
import { parseArgs, parseInitArgs } from './args.js';

describe('parseArgs', () => {
  it('parses the scaffold flags', () => {
    const args = parseArgs(['my-app', '--ssr', '--react-aria', '--pm', 'yarn', '-y', '--no-git']);
    expect(args).toMatchObject({
      projectName: 'my-app',
      variant: 'react-ts-ssr',
      reactAria: true,
      mui: false,
      pm: 'yarn',
      yes: true,
      git: false,
      install: true,
    });
  });

  it('rejects unknown flags instead of ignoring them', () => {
    expect(() => parseArgs(['my-app', '--react-area'])).toThrow(/Unknown option: --react-area/);
  });

  it('rejects an unsupported package manager', () => {
    expect(() => parseArgs(['my-app', '--pm', 'bun'])).toThrow(/--pm must be one of/);
  });
});

describe('parseInitArgs', () => {
  it('rejects scaffold-only flags', () => {
    expect(() => parseInitArgs(['--ssr'])).toThrow(/Unknown option: --ssr/);
  });
});
