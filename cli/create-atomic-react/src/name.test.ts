import { describe, expect, it } from 'vitest';
import { toPackageName } from './name.js';

describe('toPackageName', () => {
  it.each([
    ['my-app', 'my-app'],
    ['MyApp', 'myapp'],
    ['My App', 'my-app'],
    ['  spaced  out  ', 'spaced-out'],
    ['_private', 'private'],
    ['app.v2', 'app.v2'],
    ['weird!!name', 'weird-name'],
  ])('%s -> %s', (input, expected) => {
    expect(toPackageName(input)).toBe(expected);
  });

  it('returns an empty string when nothing usable is left', () => {
    expect(toPackageName('!!!')).toBe('');
  });
});
