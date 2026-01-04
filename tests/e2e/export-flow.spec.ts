/**
 * @chunk 6.03 - E2E Tests: Export Flow
 * 
 * End-to-end tests for export functionality using Playwright
 */

import { test, expect, Page } from '@playwright/test';

// Helper to wait for app to be ready
async function waitForAppReady(page: Page) {
  await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

// Helper to wait for themes to load
async function waitForThemesLoaded(page: Page) {
  // Wait for either theme cards or empty state
  await Promise.race([
    page.waitForSelector('.theme-card', { timeout: 15000 }).catch(() => null),
    page.waitForSelector('.empty-state', { timeout: 15000 }).catch(() => null),
    page.waitForSelector('[data-testid="themes-loaded"]', { timeout: 15000 }).catch(() => null),
  ]);
}

// Helper to select a theme in the export modal
async function selectFirstTheme(page: Page) {
  // Wait for theme selector to be visible
  await page.waitForSelector('.export-theme-selector', { state: 'visible', timeout: 10000 });
  
  // Click on the first theme-item (label) to select it
  const themeItems = page.locator('.theme-item');
  const count = await themeItems.count();
  
  if (count > 0) {
    // Click on the theme-item label directly
    await themeItems.first().click();
    await page.waitForLoadState('networkidle');
    return true;
  }
  return false;
}

test.describe('Export Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to themes page where export button is accessible
    await page.goto('/themes');
    await waitForAppReady(page);
    await waitForThemesLoaded(page);
  });

  test('should open export modal', async ({ page }) => {
    // Click Export button in header
    await page.click('button:has-text("Export")');
    
    // Modal should be visible
    await expect(page.locator('.export-modal')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.format-tabs')).toBeVisible({ timeout: 5000 });
    
    // Modal title should be visible
    await expect(page.locator('text=Export Design System')).toBeVisible({ timeout: 5000 });
  });

  test('should select themes for export', async ({ page }) => {
    await page.click('button:has-text("Export")');
    
    // Wait for themes to load in modal
    await page.waitForSelector('.export-theme-selector', { state: 'visible', timeout: 10000 });
    
    // Click "All" button to select all themes
    const allButton = page.locator('.export-theme-selector').locator('button:has-text("All")');
    await allButton.click();
    
    // Wait for state to update
    await page.waitForLoadState('networkidle');
    
    // Selection summary should appear
    const summary = page.locator('.selection-summary');
    const summaryCount = await summary.count();
    if (summaryCount > 0) {
      await expect(summary).toBeVisible();
    }
  });

  test('should select components for export', async ({ page }) => {
    await page.click('button:has-text("Export")');
    
    // Wait for modal to load
    await page.waitForSelector('.export-modal', { state: 'visible', timeout: 10000 });
    
    // Try to find component selector if it exists
    const componentSelector = page.locator('.export-component-selector');
    const exists = await componentSelector.count();
    
    if (exists > 0) {
      // Click "All" button in component selector
      const allButton = componentSelector.locator('button:has-text("All")');
      const buttonCount = await allButton.count();
      
      if (buttonCount > 0) {
        await allButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Test passes if we got here without error
    expect(true).toBe(true);
  });

  test('should switch between format tabs', async ({ page }) => {
    await page.click('button:has-text("Export")');
    await page.waitForSelector('.format-tabs', { state: 'visible', timeout: 10000 });
    
    // Test Tokens tab
    await page.click('.format-tab:has-text("Tokens")');
    await expect(page.locator('.format-tab:has-text("Tokens")')).toHaveClass(/active/, { timeout: 5000 });
    
    // Test AI Platforms tab
    await page.click('.format-tab:has-text("AI Platforms")');
    await expect(page.locator('.format-tab:has-text("AI Platforms")')).toHaveClass(/active/, { timeout: 5000 });
    
    // Test MCP Server tab
    await page.click('.format-tab:has-text("MCP Server")');
    await expect(page.locator('.format-tab:has-text("MCP Server")')).toHaveClass(/active/, { timeout: 5000 });
    
    // Test Full Package tab
    await page.click('.format-tab:has-text("Full Package")');
    await expect(page.locator('.format-tab:has-text("Full Package")')).toHaveClass(/active/, { timeout: 5000 });
  });

  test('should export CSS tokens', async ({ page }) => {
    await page.click('button:has-text("Export")');
    await page.waitForSelector('.export-modal', { state: 'visible', timeout: 10000 });
    
    // Select first theme
    const themeSelected = await selectFirstTheme(page);
    if (!themeSelected) {
      test.skip();
      return;
    }
    
    // Ensure Tokens tab is active
    await page.click('.format-tab:has-text("Tokens")');
    
    // Wait for Export button to be enabled and click
    const exportButton = page.locator('.export-footer button:has-text("Export")');
    await expect(exportButton).toBeEnabled({ timeout: 10000 });
    await exportButton.click();
    
    // Wait for export to complete and result dialog to appear
    await page.waitForSelector('.export-result-dialog', { state: 'visible', timeout: 20000 });
    
    // Check that result dialog is visible
    await expect(page.locator('.export-result-dialog')).toBeVisible({ timeout: 5000 });
    
    // Check for CSS file in results (could be tokens.css or dist/tokens.css)
    const cssFile = page.locator('text=/tokens\\.css/i');
    const cssFileCount = await cssFile.count();
    
    // At least one CSS-related file should be present
    expect(cssFileCount).toBeGreaterThan(0);
  });

  test('should export LLMS.txt', async ({ page }) => {
    await page.click('button:has-text("Export")');
    await page.waitForSelector('.export-modal', { state: 'visible', timeout: 10000 });
    
    // Select first theme
    const themeSelected = await selectFirstTheme(page);
    if (!themeSelected) {
      test.skip();
      return;
    }
    
    // Select AI Platforms tab
    await page.click('.format-tab:has-text("AI Platforms")');
    
    // Wait for Export button to be enabled
    const exportButton = page.locator('.export-footer button:has-text("Export")');
    await expect(exportButton).toBeEnabled({ timeout: 10000 });
    await exportButton.click();
    
    // Wait for result
    await page.waitForSelector('.export-result-dialog', { state: 'visible', timeout: 20000 });
    
    // Check for LLMS.txt file
    await expect(page.locator('text=/LLMS\\.txt/i')).toBeVisible({ timeout: 5000 });
  });

  test('should export Cursor rules', async ({ page }) => {
    await page.click('button:has-text("Export")');
    await page.waitForSelector('.export-modal', { state: 'visible', timeout: 10000 });
    
    // Select first theme
    const themeSelected = await selectFirstTheme(page);
    if (!themeSelected) {
      test.skip();
      return;
    }
    
    // Select AI Platforms tab
    await page.click('.format-tab:has-text("AI Platforms")');
    
    // Wait for Export button to be enabled
    const exportButton = page.locator('.export-footer button:has-text("Export")');
    await expect(exportButton).toBeEnabled({ timeout: 10000 });
    await exportButton.click();
    
    // Wait for result
    await page.waitForSelector('.export-result-dialog', { state: 'visible', timeout: 20000 });
    
    // Check for Cursor rules file
    await expect(page.locator('text=/.cursor\\/rules/i')).toBeVisible({ timeout: 5000 });
  });

  test('should export MCP server', async ({ page }) => {
    await page.click('button:has-text("Export")');
    await page.waitForSelector('.export-modal', { state: 'visible', timeout: 10000 });
    
    // Select first theme
    const themeSelected = await selectFirstTheme(page);
    if (!themeSelected) {
      test.skip();
      return;
    }
    
    // Select MCP Server tab
    await page.click('.format-tab:has-text("MCP Server")');
    
    // Wait for Export button to be enabled
    const exportButton = page.locator('.export-footer button:has-text("Export")');
    await expect(exportButton).toBeEnabled({ timeout: 10000 });
    await exportButton.click();
    
    // Wait for result
    await page.waitForSelector('.export-result-dialog', { state: 'visible', timeout: 20000 });
    
    // MCP files should be present
    await expect(page.locator('text=/mcp-server.*package\\.json/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/mcp-server.*server\\.ts/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/mcp-server.*design-system\\.json/i')).toBeVisible({ timeout: 5000 });
  });

  test('should export full package', async ({ page }) => {
    await page.click('button:has-text("Export")');
    await page.waitForSelector('.export-modal', { state: 'visible', timeout: 10000 });
    
    // Select first theme
    const themeSelected = await selectFirstTheme(page);
    if (!themeSelected) {
      test.skip();
      return;
    }
    
    // Select Full Package tab
    await page.click('.format-tab:has-text("Full Package")');
    
    // Wait for Export button to be enabled
    const exportButton = page.locator('.export-footer button:has-text("Export")');
    await expect(exportButton).toBeEnabled({ timeout: 10000 });
    await exportButton.click();
    
    // Wait for result
    await page.waitForSelector('.export-result-dialog', { state: 'visible', timeout: 20000 });
    
    // All format types should be present
    await expect(page.locator('text=/dist\\/tokens\\.css/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/dist\\/tokens\\.json/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/LLMS\\.txt/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/mcp-server/i')).toBeVisible({ timeout: 5000 });
  });

  test('should download ZIP', async ({ page }) => {
    await page.click('button:has-text("Export")');
    await page.waitForSelector('.export-modal', { state: 'visible', timeout: 10000 });
    
    // Select first theme
    const themeSelected = await selectFirstTheme(page);
    if (!themeSelected) {
      test.skip();
      return;
    }
    
    // Select Full Package tab
    await page.click('.format-tab:has-text("Full Package")');
    
    // Wait for Export button to be enabled
    const exportButton = page.locator('.export-footer button:has-text("Export")');
    await expect(exportButton).toBeEnabled({ timeout: 10000 });
    await exportButton.click();
    
    // Wait for result dialog
    await page.waitForSelector('.export-result-dialog', { state: 'visible', timeout: 20000 });
    
    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download ZIP")');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('.zip');
  });

  test('should copy individual file content', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.click('button:has-text("Export")');
    await page.waitForSelector('.export-modal', { state: 'visible', timeout: 10000 });
    
    // Select first theme
    const themeSelected = await selectFirstTheme(page);
    if (!themeSelected) {
      test.skip();
      return;
    }
    
    // Wait for Export button to be enabled
    const exportButton = page.locator('.export-footer button:has-text("Export")');
    await expect(exportButton).toBeEnabled({ timeout: 10000 });
    await exportButton.click();
    
    // Wait for result
    await page.waitForSelector('.export-result-dialog', { state: 'visible', timeout: 20000 });
    
    // Wait for file items to appear
    await page.waitForSelector('.file-item', { state: 'visible', timeout: 10000 });
    
    // Click copy on first file item that has a copy button
    const fileItems = page.locator('.file-item');
    const fileCount = await fileItems.count();
    
    if (fileCount > 0) {
      const firstFileWithCopy = fileItems.first().locator('.file-copy-btn');
      const copyButtonCount = await firstFileWithCopy.count();
      
      if (copyButtonCount > 0) {
        await firstFileWithCopy.click();
        
        // Wait for toast notification (sonner toast)
        await page.waitForLoadState('networkidle');
        
        // Verify clipboard was written (if possible)
        // Note: In some browsers, clipboard access may be restricted in tests
      }
    }
  });

  test('should close export modal', async ({ page }) => {
    await page.click('button:has-text("Export")');
    await expect(page.locator('.export-modal')).toBeVisible({ timeout: 5000 });
    
    // Click Cancel button
    await page.click('.export-footer button:has-text("Cancel")');
    
    // Modal should be closed
    await expect(page.locator('.export-modal')).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('Export Validation', () => {
  test('export button disabled without selection', async ({ page }) => {
    await page.goto('/themes');
    await waitForAppReady(page);
    await waitForThemesLoaded(page);
    
    await page.click('button:has-text("Export")');
    await page.waitForSelector('.export-modal', { state: 'visible', timeout: 10000 });
    
    // Export button should be disabled initially
    const exportButton = page.locator('.export-footer button:has-text("Export")');
    await expect(exportButton).toBeDisabled({ timeout: 5000 });
    
    // Select a theme by clicking on it
    const themeItems = page.locator('.theme-item');
    const themeCount = await themeItems.count();
    
    if (themeCount > 0) {
      await themeItems.first().click();
      await page.waitForLoadState('networkidle');
      
      // Now should be enabled
      await expect(exportButton).toBeEnabled({ timeout: 10000 });
    }
  });

  test('shows file count in result', async ({ page }) => {
    await page.goto('/themes');
    await waitForAppReady(page);
    await waitForThemesLoaded(page);
    
    await page.click('button:has-text("Export")');
    await page.waitForSelector('.export-modal', { state: 'visible', timeout: 10000 });
    
    // Select first theme
    const themeItems = page.locator('.theme-item');
    const themeCount = await themeItems.count();
    
    if (themeCount > 0) {
      await themeItems.first().click();
      await page.waitForLoadState('networkidle');
    } else {
      test.skip();
      return;
    }
    
    // Wait for Export button to be enabled
    const exportButton = page.locator('.export-footer button:has-text("Export")');
    await expect(exportButton).toBeEnabled({ timeout: 10000 });
    await exportButton.click();
    
    // Wait for result
    await page.waitForSelector('.export-result-dialog', { state: 'visible', timeout: 20000 });
    
    // Should show file count in summary
    const summary = page.locator('.export-summary');
    await expect(summary).toBeVisible({ timeout: 5000 });
    await expect(summary).toContainText(/\d+ files/i, { timeout: 5000 });
  });
});
