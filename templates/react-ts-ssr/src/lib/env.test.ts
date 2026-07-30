import { describe, expect, it } from 'vitest';
import { parseEnv } from './env';

describe('parseEnv', () => {
  it('applies defaults when input is undefined or empty', () => {
    expect(parseEnv(undefined).VITE_APP_TITLE).toBe('react-app-boilerplate');
    expect(parseEnv({}).VITE_OEMBED_BASE_URL).toBe('https://noembed.com/embed');
  });

  it('coerces the sentry sample rate from string to number', () => {
    expect(parseEnv({ VITE_SENTRY_TRACES_SAMPLE_RATE: '0.5' }).VITE_SENTRY_TRACES_SAMPLE_RATE).toBe(
      0.5,
    );
  });

  it('throws when a value fails the schema', () => {
    expect(() => parseEnv({ VITE_APP_TITLE: '' })).toThrow(/Invalid environment variables/);
    expect(() => parseEnv({ VITE_SENTRY_DSN: 'not-a-url' })).toThrow(/Invalid environment/);
  });
});
