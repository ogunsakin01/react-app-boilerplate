import { expect, test } from '@playwright/test';

// EXAMPLE - this spec covers the YouTube demo. Replace with your own once you
// strip `src/**/example`.

const YT_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

test('home page renders the docs + example cta cards', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /browse docs/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /try the example/i })).toBeVisible();
});

test('example page loads a video onto /watch when a URL is submitted', async ({ page }) => {
  await page.goto('/example');
  await page.waitForLoadState('networkidle');
  await page.getByRole('textbox').fill(YT_URL);
  await page.getByRole('button', { name: /load video/i }).click();

  await expect(page).toHaveURL(/\/watch\?v=dQw4w9WgXcQ/);

  const iframe = page.locator('iframe').first();
  await expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');

  await expect(page.getByRole('heading', { name: 'Never Gonna Give You Up' })).toBeVisible();
});

test('invalid URL is rejected with a validation error', async ({ page }) => {
  await page.goto('/example');
  await page.waitForLoadState('networkidle');
  await page.getByRole('textbox').fill('https://vimeo.com/12345');
  await page.getByRole('button', { name: /load video/i }).click();
  await expect(page.getByRole('alert')).toContainText(/YouTube URL/i);
});
