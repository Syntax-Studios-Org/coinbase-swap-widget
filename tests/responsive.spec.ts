import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Main elements should still be visible
    await expect(page.getByRole('heading', { name: 'Swap' })).toBeVisible();
    await expect(page.getByText('You\'re paying')).toBeVisible();
    await expect(page.getByText('To receive')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Main elements should still be visible
    await expect(page.getByRole('heading', { name: 'Swap' })).toBeVisible();
    await expect(page.getByText('Buy Crypto with ease')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // All elements should be visible
    await expect(page.getByRole('heading', { name: 'Swap' })).toBeVisible();
    await expect(page.getByText('Trade details')).toBeVisible();
  });

  test('swap widget should be responsive on mobile', async ({ page }) => {
    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Main swap elements should be visible and usable
    await expect(page.getByText('You\'re paying')).toBeVisible();
    await expect(page.getByText('To receive')).toBeVisible();
    await expect(page.getByRole('button', { name: /Connect Wallet|Select tokens/ })).toBeVisible();
  });
});