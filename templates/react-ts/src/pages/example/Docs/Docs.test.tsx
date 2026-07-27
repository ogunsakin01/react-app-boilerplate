import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...rest }: React.PropsWithChildren<Record<string, unknown>>) => (
    <a {...rest}>{children}</a>
  ),
}));

import { Docs } from './Docs';

describe('Docs', () => {
  it('renders the accessibility and conventions sections with real source snippets', () => {
    render(<Docs />);

    expect(screen.getByRole('heading', { level: 2, name: /accessibility/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /conventions/i })).toBeInTheDocument();

    expect(screen.getAllByText('src/test/setup.ts').length).toBeGreaterThan(0);
    expect(screen.getByText('scripts/generate.mjs')).toBeInTheDocument();
    expect(
      screen.getAllByText('src/components/molecules/example/VideoUrlForm/VideoUrlForm.tsx').length,
    ).toBeGreaterThan(0);
  });
});
