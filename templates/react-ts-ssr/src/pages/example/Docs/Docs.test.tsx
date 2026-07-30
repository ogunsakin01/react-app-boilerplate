import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
