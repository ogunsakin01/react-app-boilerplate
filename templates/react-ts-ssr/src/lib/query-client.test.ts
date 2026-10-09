import { describe, expect, it } from 'vitest';
import { ApiError } from './api';
import { queryClient, shouldRetry } from './query-client';

describe('shouldRetry', () => {
  it('never retries client errors', () => {
    expect(shouldRetry(0, new ApiError(404, '/users/1'))).toBe(false);
    expect(shouldRetry(0, new ApiError(401, '/me'))).toBe(false);
  });

  it('retries server and network errors once', () => {
    expect(shouldRetry(0, new ApiError(503, '/users'))).toBe(true);
    expect(shouldRetry(0, new TypeError('Failed to fetch'))).toBe(true);
    expect(shouldRetry(1, new TypeError('Failed to fetch'))).toBe(false);
  });

  it('is the default retry policy for queries', () => {
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(shouldRetry);
  });
});
