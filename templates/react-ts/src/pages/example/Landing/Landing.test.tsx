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

import { Landing } from './Landing';

describe('Landing', () => {
  it('renders the two CTA cards pointing at docs and the example', () => {
    render(<Landing />);
    expect(
      screen.getByRole('heading', { level: 1, name: /welcome to your react/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse docs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /try the example/i })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Landing />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
