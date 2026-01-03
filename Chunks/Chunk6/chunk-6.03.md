# Chunk 6.03 — E2E Tests: Export Flow

## Purpose
End-to-end tests for export functionality.

---

## Inputs
- Playwright test framework
- Running application

## Outputs
- Export flow E2E tests

---

## Dependencies
- Phase 5 must be complete

---

## Implementation Notes

```typescript
// tests/e2e/export-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Export Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/themes');
  });

  test('should open export modal', async ({ page }) => {
    await page.click('button:has-text("Export")');
    
    await expect(page.locator('.export-modal')).toBeVisible();
    await expect(page.locator('.format-tabs')).toBeVisible();
  });

  test('should select themes for export', async ({ page }) => {
    await page.click('button:has-text("Export")');
    
    // Select all themes
    await page.click('button:has-text("All")');
    
    const checkboxes = page.locator('.theme-item input[type="checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('should select components for export', async ({ page }) => {
    await page.click('button:has-text("Export")');
    
    // Filter by category
    await page.selectOption('.component-selector select', 'buttons');
    
    // Select all in category
    await page.click('.component-selector button:has-text("All")');
    
    const checkboxes = page.locator('.component-item input[type="checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('should export CSS tokens', async ({ page }) => {
    await page.click('button:has-text("Export")');
    
    // Select theme
    await page.click('.theme-item >> nth=0');
    
    // Select Tokens tab
    await page.click('.format-tab:has-text("Tokens")');
    
    // Export
    await page.click('button:has-text("Export")');
    
    // Result dialog should show
    await expect(page.locator('.export-result')).toBeVisible();
    
    // CSS file should be in list
    await expect(page.locator('text=tokens.css')).toBeVisible();
  });

  test('should export LLMS.txt', async ({ page }) => {
    await page.click('button:has-text("Export")');
    
    await page.click('.theme-item >> nth=0');
    await page.click('.format-tab:has-text("AI Platforms")');
    await page.click('button:has-text("Export")');
    
    await expect(page.locator('text=LLMS.txt')).toBeVisible();
  });

  test('should export Cursor rules', async ({ page }) => {
    await page.click('button:has-text("Export")');
    
    await page.click('.theme-item >> nth=0');
    await page.click('.format-tab:has-text("AI Platforms")');
    await page.click('button:has-text("Export")');
    
    await expect(page.locator('text=.cursor/rules/design-system.mdc')).toBeVisible();
  });

  test('should export MCP server', async ({ page }) => {
    await page.click('button:has-text("Export")');
    
    await page.click('.theme-item >> nth=0');
    await page.click('.format-tab:has-text("MCP Server")');
    await page.click('button:has-text("Export")');
    
    // MCP files should be present
    await expect(page.locator('text=mcp-server/package.json')).toBeVisible();
    await expect(page.locator('text=mcp-server/src/server.ts')).toBeVisible();
    await expect(page.locator('text=mcp-server/design-system.json')).toBeVisible();
  });

  test('should export full package', async ({ page }) => {
    await page.click('button:has-text("Export")');
    
    await page.click('.theme-item >> nth=0');
    await page.click('.format-tab:has-text("Full Package")');
    await page.click('button:has-text("Export")');
    
    // All format types should be present
    await expect(page.locator('text=dist/tokens.css')).toBeVisible();
    await expect(page.locator('text=dist/tokens.json')).toBeVisible();
    await expect(page.locator('text=LLMS.txt')).toBeVisible();
    await expect(page.locator('text=mcp-server/')).toBeVisible();
  });

  test('should download ZIP', async ({ page }) => {
    await page.click('button:has-text("Export")');
    
    await page.click('.theme-item >> nth=0');
    await page.click('.format-tab:has-text("Full Package")');
    await page.click('button:has-text("Export")');
    
    // Wait for result
    await expect(page.locator('.export-result')).toBeVisible();
    
    // Start download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Download ZIP")'),
    ]);
    
    expect(download.suggestedFilename()).toContain('.zip');
  });

  test('should copy individual file content', async ({ page }) => {
    await page.click('button:has-text("Export")');
    
    await page.click('.theme-item >> nth=0');
    await page.click('button:has-text("Export")');
    
    // Click copy on first file
    await page.click('.file-item >> nth=0 >> button:has-text("Copy")');
    
    // Should show success toast
    await expect(page.locator('text=Copied')).toBeVisible();
  });

  test('should close export modal', async ({ page }) => {
    await page.click('button:has-text("Export")');
    await expect(page.locator('.export-modal')).toBeVisible();
    
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('.export-modal')).not.toBeVisible();
  });
});

test.describe('Export Validation', () => {
  test('export button disabled without selection', async ({ page }) => {
    await page.goto('/themes');
    await page.click('button:has-text("Export")');
    
    // Export button should be disabled
    await expect(page.locator('.export-footer button:has-text("Export")')).toBeDisabled();
    
    // Select a theme
    await page.click('.theme-item >> nth=0');
    
    // Now should be enabled
    await expect(page.locator('.export-footer button:has-text("Export")')).toBeEnabled();
  });

  test('shows file count in result', async ({ page }) => {
    await page.goto('/themes');
    await page.click('button:has-text("Export")');
    await page.click('.theme-item >> nth=0');
    await page.click('button:has-text("Export")');
    
    // Should show file count
    await expect(page.locator('.export-summary')).toContainText(/\d+ files/);
  });
});
```

---

## Files Created
- `tests/e2e/export-flow.spec.ts` — Export E2E tests

---

## Tests

### Verification
- [ ] All export tests pass
- [ ] Download triggers correctly
- [ ] Clipboard copy works
- [ ] All format tabs work

---

## Time Estimate
3 hours
