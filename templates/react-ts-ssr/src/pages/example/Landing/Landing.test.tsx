import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
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
