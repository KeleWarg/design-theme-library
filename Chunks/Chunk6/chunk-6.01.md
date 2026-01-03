# Chunk 6.01 — E2E Tests: Theme Flow

## Purpose
End-to-end tests for complete theme creation and editing flows.

---

## Inputs
- Playwright test framework
- Running application

## Outputs
- Theme flow E2E tests

---

## Dependencies
- Phase 2 must be complete

---

## Implementation Notes

```typescript
// tests/e2e/theme-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Theme Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/themes');
  });

  test('should create a new theme from scratch', async ({ page }) => {
    // Click create button
    await page.click('button:has-text("Create Theme")');
    
    // Select "Start from Scratch"
    await page.click('text=Start from Scratch');
    
    // Fill in name
    await page.fill('input[name="name"]', 'Test Theme');
    await page.fill('textarea[name="description"]', 'A test theme');
    
    // Submit
    await page.click('button:has-text("Create Theme")');
    
    // Should navigate to editor
    await expect(page).toHaveURL(/\/themes\/[\w-]+\/edit/);
    
    // Theme name should be visible
    await expect(page.locator('h1')).toContainText('Test Theme');
  });

  test('should import theme from JSON', async ({ page }) => {
    // Navigate to import
    await page.click('button:has-text("Create Theme")');
    await page.click('text=Import from JSON');
    await page.fill('input[name="name"]', 'Imported Theme');
    await page.click('button:has-text("Continue to Import")');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/sample-tokens.json');
    
    // Wait for parsing
    await expect(page.locator('.token-count')).toBeVisible();
    
    // Continue through wizard
    await page.click('button:has-text("Continue")');
    await page.click('button:has-text("Continue to Review")');
    await page.click('button:has-text("Import")');
    
    // Should show success
    await expect(page.locator('text=Import Complete')).toBeVisible();
  });

  test('should edit color token', async ({ page }) => {
    // Navigate to first theme
    await page.click('.theme-card >> nth=0');
    await page.click('button:has-text("Edit")');
    
    // Select Colors category
    await page.click('text=Colors');
    
    // Click first token
    await page.click('.token-list-item >> nth=0');
    
    // Color editor should appear
    await expect(page.locator('.color-editor')).toBeVisible();
    
    // Change color value
    await page.fill('input[value^="#"]', '#FF5733');
    
    // Preview should update
    const preview = page.locator('.preview-swatch');
    await expect(preview).toHaveCSS('background-color', 'rgb(255, 87, 51)');
  });

  test('should switch active theme and update CSS variables', async ({ page }) => {
    // Open theme selector
    await page.click('.theme-selector-trigger');
    
    // Select different theme
    await page.click('.theme-option >> nth=1');
    
    // CSS variables should update
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--color-primary').trim();
    });
    
    expect(primaryColor).toBeTruthy();
  });

  test('should delete theme with confirmation', async ({ page }) => {
    // Get initial theme count
    const initialCount = await page.locator('.theme-card').count();
    
    // Open actions on first theme
    await page.click('.theme-card >> nth=0 >> .dropdown-trigger');
    await page.click('text=Delete');
    
    // Confirm deletion
    await page.click('button:has-text("Delete")');
    
    // Should have one less theme
    await expect(page.locator('.theme-card')).toHaveCount(initialCount - 1);
  });

  test('should duplicate theme', async ({ page }) => {
    const initialCount = await page.locator('.theme-card').count();
    
    // Duplicate first theme
    await page.click('.theme-card >> nth=0 >> .dropdown-trigger');
    await page.click('text=Duplicate');
    
    // Fill new name
    await page.fill('input[name="name"]', 'Duplicated Theme');
    await page.click('button:has-text("Duplicate")');
    
    // Should have one more theme
    await expect(page.locator('.theme-card')).toHaveCount(initialCount + 1);
  });
});

test.describe('Token Editors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/themes');
    await page.click('.theme-card >> nth=0');
    await page.click('button:has-text("Edit")');
  });

  test('should edit typography token', async ({ page }) => {
    await page.click('text=Typography');
    await page.click('.token-list-item >> nth=0');
    
    await expect(page.locator('.typography-editor')).toBeVisible();
  });

  test('should edit spacing token with presets', async ({ page }) => {
    await page.click('text=Spacing');
    await page.click('.token-list-item >> nth=0');
    
    // Click preset
    await page.click('.preset-btn:has-text("16")');
    
    // Value should update
    await expect(page.locator('input[type="number"]')).toHaveValue('16');
  });

  test('should add shadow layer', async ({ page }) => {
    await page.click('text=Shadows');
    await page.click('.token-list-item >> nth=0');
    
    const initialLayers = await page.locator('.shadow-item').count();
    
    await page.click('button:has-text("Add Shadow")');
    
    await expect(page.locator('.shadow-item')).toHaveCount(initialLayers + 1);
  });
});
```

### Test Fixtures

```json
// tests/fixtures/sample-tokens.json
{
  "color": {
    "primary": { "$value": "#3B82F6", "$type": "color" },
    "secondary": { "$value": "#6366F1", "$type": "color" },
    "background": { "$value": "#FFFFFF", "$type": "color" },
    "foreground": { "$value": "#1F2937", "$type": "color" }
  },
  "spacing": {
    "xs": { "$value": "4px", "$type": "dimension" },
    "sm": { "$value": "8px", "$type": "dimension" },
    "md": { "$value": "16px", "$type": "dimension" },
    "lg": { "$value": "24px", "$type": "dimension" }
  },
  "radius": {
    "sm": { "$value": "4px", "$type": "dimension" },
    "md": { "$value": "8px", "$type": "dimension" },
    "lg": { "$value": "12px", "$type": "dimension" }
  }
}
```

---

## Files Created
- `tests/e2e/theme-flow.spec.ts` — Theme E2E tests
- `tests/fixtures/sample-tokens.json` — Test fixture

---

## Tests

### Verification
- [ ] All theme tests pass
- [ ] Tests run in <2 minutes
- [ ] No flaky tests
- [ ] Import flow handles various JSON formats

---

## Time Estimate
3 hours
