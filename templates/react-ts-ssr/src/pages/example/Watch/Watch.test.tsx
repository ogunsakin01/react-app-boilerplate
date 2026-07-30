import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();

vi.mock('vike/client/router', () => ({
  navigate: (url: string) => navigateMock(url),
}));

import { Watch } from './Watch';

function renderWatch(videoId: string | null) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <Watch videoId={videoId} />
    </QueryClientProvider>,
  );
}

describe('Watch', () => {
  it('shows the empty state when no videoId is provided', () => {
    renderWatch(null);
    expect(screen.getByText(/paste a url above to load a video/i)).toBeInTheDocument();
  });

  it('resubmitting the form navigates to /watch with the new id', async () => {
    const user = userEvent.setup();
    navigateMock.mockReset();
    renderWatch(null);
    await user.type(screen.getByRole('textbox'), 'https://youtu.be/dQw4w9WgXcQ');
    await user.click(screen.getByRole('button', { name: /load video/i }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/watch?v=dQw4w9WgXcQ'));
  });

  it('renders the VideoPlayer when a videoId is supplied', async () => {
    renderWatch('dQw4w9WgXcQ');
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Never Gonna Give You Up' })).toBeInTheDocument(),
    );
  });

  it('has no accessibility violations in the empty state', async () => {
    const { container } = renderWatch(null);
    expect(await axe(container)).toHaveNoViolations();
  });
});
