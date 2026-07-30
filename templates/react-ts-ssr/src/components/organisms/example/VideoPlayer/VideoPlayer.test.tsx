import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import { VideoPlayer } from './VideoPlayer';

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

afterEach(() => server.resetHandlers());

describe('VideoPlayer', () => {
  it('renders the iframe and the oEmbed title fetched via MSW', async () => {
    renderWithClient(<VideoPlayer videoId="dQw4w9WgXcQ" />);

    expect(screen.getByTitle(/YouTube video|Never Gonna Give You Up/)).toHaveAttribute(
      'src',
      expect.stringContaining('/embed/dQw4w9WgXcQ'),
    );

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Never Gonna Give You Up',
      ),
    );
    expect(screen.getByText('Rick Astley')).toBeInTheDocument();
  });

  it('shows an alert when the oEmbed fetch fails', async () => {
    server.use(http.get('https://noembed.com/embed', () => HttpResponse.error()));
    renderWithClient(<VideoPlayer videoId="dQw4w9WgXcQ" />);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/couldn/i));
  });
});
