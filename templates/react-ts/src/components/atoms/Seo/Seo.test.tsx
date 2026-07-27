import { act } from '@testing-library/react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Seo, type SeoProps } from './Seo';

function metaContent(selector: string): string | null {
  return document.head.querySelector(selector)?.getAttribute('content') ?? null;
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function renderSeo(props: SeoProps) {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container!);
    root.render(<Seo {...props} />);
  });
}

beforeEach(() => {
  document.title = '';
  document.head
    .querySelectorAll('meta[name], meta[property], link[rel="canonical"]')
    .forEach((n) => n.remove());
});

afterEach(() => {
  try {
    if (root) act(() => root!.unmount());
  } catch {
    // React 19's head hoisting cleanup can throw in jsdom — safe to swallow
  }
  container?.remove();
  container = null;
  root = null;
});

describe('Seo', () => {
  it('sets the document title and hoists meta tags into <head>', () => {
    renderSeo({
      title: 'Dashboard',
      description: "Your team's dashboard",
      siteName: 'Acme',
      canonical: 'https://acme.example.com/dashboard',
    });

    expect(document.title).toBe('Dashboard · Acme');
    expect(metaContent('meta[name="description"]')).toBe("Your team's dashboard");
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://acme.example.com/dashboard',
    );
  });

  it('emits Open Graph tags reflecting the provided values', () => {
    renderSeo({
      title: 'Guide',
      siteName: 'Acme',
      description: 'How to guide',
      canonical: 'https://acme.example.com/guide',
      image: 'https://acme.example.com/og.png',
      type: 'article',
      locale: 'en_US',
    });

    expect(metaContent('meta[property="og:title"]')).toBe('Guide · Acme');
    expect(metaContent('meta[property="og:type"]')).toBe('article');
    expect(metaContent('meta[property="og:description"]')).toBe('How to guide');
    expect(metaContent('meta[property="og:url"]')).toBe('https://acme.example.com/guide');
    expect(metaContent('meta[property="og:image"]')).toBe('https://acme.example.com/og.png');
    expect(metaContent('meta[property="og:site_name"]')).toBe('Acme');
    expect(metaContent('meta[property="og:locale"]')).toBe('en_US');
  });

  it('picks the summary_large_image twitter card when an image is provided', () => {
    renderSeo({ title: 'Guide', image: 'https://acme.example.com/og.png' });
    expect(metaContent('meta[name="twitter:card"]')).toBe('summary_large_image');
  });

  it('falls back to the summary twitter card when no image is provided', () => {
    renderSeo({ title: 'Guide' });
    expect(metaContent('meta[name="twitter:card"]')).toBe('summary');
  });

  it('omits optional tags when props are undefined', () => {
    renderSeo({ title: 'Bare' });
    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it('emits a robots meta tag when robots is provided', () => {
    renderSeo({ title: 'Draft', robots: 'noindex,nofollow' });
    expect(metaContent('meta[name="robots"]')).toBe('noindex,nofollow');
  });
});
