import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
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

import { NotFound } from './NotFound';

describe('NotFound', () => {
  it('renders the heading and a back-home link', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { name: /not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back home/i })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NotFound />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
