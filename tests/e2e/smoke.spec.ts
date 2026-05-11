import { test, expect } from '@playwright/test';

test('homepage shows hero, POV bar, and primary CTAs', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /AI lab/i })).toBeVisible();
  await expect(page.getByText('Entry-level IT work').first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Book me to speak/i })).toBeVisible();
});

test('nav links work to all primary pages', async ({ page }) => {
  await page.goto('/');
  for (const label of ['Speaking', 'Writing', 'Talks', 'Teaching', 'About']) {
    await page.getByRole('link', { name: label, exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`/${label.toLowerCase()}`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goto('/');
  }
});

test('speaking page renders 8 topic cards and booking form', async ({ page }) => {
  await page.goto('/speaking');
  await expect(page.locator('.topic')).toHaveCount(8);
  await expect(page.locator('form#book')).toBeVisible();
  await expect(page.getByLabel(/Your name/i)).toBeVisible();
});

test('writing post renders prose', async ({ page }) => {
  await page.goto('/writing/2026-05-xapi-lab-stack');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('xAPI');
  await expect(page.locator('.prose')).toBeVisible();
});

test('RSS feed returns valid XML', async ({ request }) => {
  const res = await request.get('/rss.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('xml');
  const body = await res.text();
  expect(body).toContain('<rss');
  expect(body).toContain('Frazier Smith');
});

test('404 page renders for unknown URL', async ({ page }) => {
  const res = await page.goto('/this-does-not-exist');
  expect(res?.status()).toBe(404);
  await expect(page.getByText('404')).toBeVisible();
});
