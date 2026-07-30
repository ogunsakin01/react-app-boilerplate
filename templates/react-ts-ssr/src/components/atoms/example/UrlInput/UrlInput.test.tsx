import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UrlInput } from './UrlInput';

describe('UrlInput', () => {
  it('renders as a url input', () => {
    render(<UrlInput aria-label="url" />);
    expect(screen.getByLabelText('url')).toHaveAttribute('type', 'url');
  });

  it('adds error styling when hasError is true', () => {
    render(<UrlInput aria-label="url" hasError />);
    expect(screen.getByLabelText('url').className).toMatch(/border-primary/);
  });
});
