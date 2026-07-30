import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import { OEMBED_FIXTURE } from '@/mocks/handlers';
import { useVideoOEmbed } from './useVideoOEmbed';

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useVideoOEmbed', () => {
  it('stays disabled and idle when videoId is null', () => {
    const { result } = renderHook(() => useVideoOEmbed(null), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('fetches oembed data via the configured base URL for a valid videoId', async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get('https://noembed.com/embed', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(OEMBED_FIXTURE);
      }),
    );

    const { result } = renderHook(() => useVideoOEmbed('dQw4w9WgXcQ'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.title).toBe('Never Gonna Give You Up');
    expect(capturedUrl).toContain('url=');
    expect(capturedUrl).toContain(
      encodeURIComponent('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    );
  });

  it('surfaces an error when the oembed endpoint returns a failure', async () => {
    server.use(
      http.get('https://noembed.com/embed', () => new HttpResponse(null, { status: 500 })),
    );

    const { result } = renderHook(() => useVideoOEmbed('dQw4w9WgXcQ'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
