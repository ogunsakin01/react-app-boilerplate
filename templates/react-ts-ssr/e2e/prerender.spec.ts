import { expect, test } from '@playwright/test';
import { PREVIEW_URL } from './playwright.config';

// What a crawler or link-preview bot gets: the prerendered HTML, no JavaScript.
for (const path of ['/', '/docs', '/example']) {
  test(`${path} ships its title and description in the static HTML`, async ({ request }) => {
    const res = await request.get(`${PREVIEW_URL}${path}`);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toMatch(/<title>[^<]+<\/title>/);
    expect(html).toMatch(/<meta name="description" content="[^"]+"/);
    expect(html).toMatch(/<meta property="og:title" content="[^"]+"/);
  });
}

test('unknown paths get the prerendered 404 page', async ({ request }) => {
  const res = await request.get(`${PREVIEW_URL}/definitely-not-a-page`);
  const html = await res.text();
  expect(html).toContain('Not found');
});

test('a deep link with a query string hydrates without a mismatch', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(`${PREVIEW_URL}/watch?v=dQw4w9WgXcQ`);
  await page.waitForLoadState('networkidle');

  await expect(page.locator('iframe').first()).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  );
  // Production React reports hydration mismatches as minified errors
  // (#418 text, #423 recoverable, #425 text content), not by name.
  const hydrationErrors = errors.filter((e) =>
    /hydrat|Minified React error #(418|423|425)/i.test(e),
  );
  expect(hydrationErrors).toEqual([]);
});
