import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import { ApiError, apiGet } from './api';

afterEach(() => server.resetHandlers());

describe('apiGet', () => {
  it('parses a JSON response when the request succeeds', async () => {
    server.use(http.get('https://example.test/data', () => HttpResponse.json({ ok: true })));
    await expect(apiGet<{ ok: boolean }>('https://example.test/data')).resolves.toEqual({
      ok: true,
    });
  });

  it('merges caller-supplied headers on top of the default Accept header', async () => {
    let seen: string | null = null;
    server.use(
      http.get('https://example.test/echo', ({ request }) => {
        seen = request.headers.get('x-custom');
        return HttpResponse.json({});
      }),
    );
    await apiGet('https://example.test/echo', { headers: { 'x-custom': 'yes' } });
    expect(seen).toBe('yes');
  });

  it('throws an ApiError with the status when the response is not ok', async () => {
    server.use(
      http.get('https://example.test/nope', () => new HttpResponse(null, { status: 503 })),
    );
    await expect(apiGet('https://example.test/nope')).rejects.toBeInstanceOf(ApiError);
    await expect(apiGet('https://example.test/nope')).rejects.toMatchObject({
      status: 503,
      path: 'https://example.test/nope',
    });
  });

  it('ApiError falls back to a default message when none is supplied', () => {
    const err = new ApiError(404, '/missing');
    expect(err.message).toBe('Request failed: 404 /missing');
    expect(new ApiError(500, '/x', 'boom').message).toBe('boom');
  });
});
