import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CtaCard } from './CtaCard';

describe('CtaCard', () => {
  it('renders title, description, icon slot, and cta link', () => {
    render(
      <CtaCard
        icon={<svg data-testid="icon" />}
        title="Docs"
        description="Read the docs"
        href="/target"
        ctaLabel="Open"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Docs' })).toBeInTheDocument();
    expect(screen.getByText('Read the docs')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open/i })).toHaveAttribute('href', '/target');
  });
});
