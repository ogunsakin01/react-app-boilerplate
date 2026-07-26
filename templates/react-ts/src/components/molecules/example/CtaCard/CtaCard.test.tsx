import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CtaCard } from './CtaCard';

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    ...rest
  }: { to: string; children: ReactNode } & Record<string, unknown>) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

describe('CtaCard', () => {
  it('renders title, description, icon slot, and cta link', () => {
    render(
      <CtaCard
        icon={<svg data-testid="icon" />}
        title="Docs"
        description="Read the docs"
        to="/target"
        ctaLabel="Open"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Docs' })).toBeInTheDocument();
    expect(screen.getByText('Read the docs')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open/i })).toHaveAttribute('href', '/target');
  });
});
