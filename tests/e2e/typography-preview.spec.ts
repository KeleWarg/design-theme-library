import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Typography edit + preview flow', () => {
  test('creates a typography token and updates preview font size', async ({ page }) => {
    // Navigate to themes
    await page.goto(`${baseUrl}/themes`);

    // Ensure themes page loaded
    await expect(page.getByRole('heading', { name: /Themes/i })).toBeVisible();

    // Create a fresh theme so the flow is deterministic
    await page.getByRole('button', { name: /Create Theme/i }).click();
    await page.getByRole('button', { name: /Start from Scratch/i }).click();

    const themeName = `Typography E2E ${Date.now()}`;
    await page.getByLabel('Theme Name').fill(themeName);
    await page.getByRole('button', { name: /Create Theme/i }).click();

    // Land on the theme editor
    await page.waitForURL(/\/themes\/[^/]+$/);

    // Switch to Typography category
    await page.getByRole('button', { name: /Typography/i }).click();

    // Add a typography token
    await page.getByRole('button', { name: /Add typography token/i }).click();
    await page.getByLabel('Token Name').fill('Body L');
    // Keep default type; set a simple numeric value
    const valueTextarea = page.getByLabel('Value');
    await valueTextarea.fill('18');
    await page.getByRole('button', { name: /Add Token/i }).click();

    // Select the newly added token (first in the list)
    const tokenItem = page.locator('.token-list-item').first();
    await expect(tokenItem).toBeVisible();
    await tokenItem.click();

    // Typography editor should appear
    const previewText = page.locator('.typography-preview-text').first();
    await expect(previewText).toBeVisible();

    // Capture initial font size
    const initialSize = await previewText.evaluate((el) => getComputedStyle(el).fontSize);

    // Update value to 22 and blur to save
    const valueInput = page.getByLabel('Value');
    await valueInput.fill('22');
    await valueInput.blur();

    // Expect preview font size to update
    await expect.poll(async () => {
      return previewText.evaluate((el) => getComputedStyle(el).fontSize);
    }).toBe('22px');

    // Ensure the font size actually changed from the initial value
    expect(initialSize).not.toBe('22px');
  });
});




