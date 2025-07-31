import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');
    
    // Check if the main heading is visible
    await expect(page.getByRole('heading', { name: 'Swap' })).toBeVisible();
    
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Coinbase CDP Swap/);
  });

  test('should show connect wallet button when not signed in', async ({ page }) => {
    await page.goto('/');
    
    // Should show connect wallet button
    await expect(page.getByRole('button', { name: 'Connect Wallet' })).toBeVisible();
  });

  test('should display token selection dropdowns', async ({ page }) => {
    await page.goto('/');
    
    // Check for "From" token selector
    await expect(page.getByText('You\'re paying')).toBeVisible();
    
    // Check for "To" token selector  
    await expect(page.getByText('To receive')).toBeVisible();
  });

  test('should show onramp button', async ({ page }) => {
    await page.goto('/');
    
    // Check if onramp section is visible
    await expect(page.getByText('Buy Crypto with ease')).toBeVisible({ timeout: 10000 });
  });
});