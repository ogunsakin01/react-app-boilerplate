import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { VideoPlayer } from './VideoPlayer';

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

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
});
