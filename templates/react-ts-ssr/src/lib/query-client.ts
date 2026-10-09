import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';

// A 4xx won't succeed on retry (bad input, missing auth, not found), so only
// network errors and 5xx are retried, once.
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
  },
});
