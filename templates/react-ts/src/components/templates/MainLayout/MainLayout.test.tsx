import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    ...rest
  }: React.PropsWithChildren<{ to: string; activeProps?: unknown } & Record<string, unknown>>) => {
    const { activeProps, ...domProps } = rest as { activeProps?: unknown };
    void activeProps;
    return (
      <a href={to} {...domProps}>
        {children}
      </a>
    );
  },
}));

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [false, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}));

import { ThemeProvider } from '@/providers/ThemeProvider';
import { MainLayout } from './MainLayout';

function renderLayout() {
  return render(
    <ThemeProvider>
      <MainLayout>
        <p>page body</p>
      </MainLayout>
    </ThemeProvider>,
  );
}

describe('MainLayout', () => {
  it('renders the primary nav, GitHub link, and children', () => {
    renderLayout();
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /docs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /example/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
      'href',
      expect.stringContaining('github.com'),
    );
    expect(screen.getByText('page body')).toBeInTheDocument();
  });

  it('toggles the theme via the header button', async () => {
    const user = userEvent.setup();
    renderLayout();

    const toggle = screen.getByRole('button', { name: /switch to dark theme/i });
    await user.click(toggle);

    expect(screen.getByRole('button', { name: /switch to light theme/i })).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderLayout();
    expect(await axe(container)).toHaveNoViolations();
  });
});
