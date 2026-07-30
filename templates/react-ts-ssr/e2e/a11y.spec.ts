import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes: { name: string; path: string }[] = [
  { name: 'home', path: '/' },
  { name: 'docs', path: '/docs' },
  { name: 'example', path: '/example' },
];

for (const { name, path } of routes) {
  test(`${name} has no detectable accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test('example page announces validation errors accessibly', async ({ page }) => {
  await page.goto('/example');
  await page.getByRole('textbox').fill('https://vimeo.com/12345');
  await page.getByRole('button', { name: /load video/i }).click();
  await expect(page.getByRole('alert')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include('form[aria-label="Load YouTube video"]')
    .analyze();
  expect(results.violations).toEqual([]);
});
