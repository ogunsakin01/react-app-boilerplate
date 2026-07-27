import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
  Link: ({
    to,
    children,
    ...rest
  }: React.PropsWithChildren<{ to: string } & Record<string, unknown>>) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

import { Example } from './Example';

describe('Example', () => {
  it('renders the page heading + the URL form', () => {
    render(<Example />);
    expect(
      screen.getByRole('heading', { level: 1, name: /paste a youtube url/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /load video/i })).toBeInTheDocument();
  });

  it('navigates to /watch with the extracted video id on submit', async () => {
    const user = userEvent.setup();
    navigateMock.mockReset();
    render(<Example />);
    await user.type(screen.getByRole('textbox'), 'https://youtu.be/dQw4w9WgXcQ');
    await user.click(screen.getByRole('button', { name: /load video/i }));

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/watch',
        search: { v: 'dQw4w9WgXcQ' },
      }),
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Example />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
