# Chunk 6.02 — E2E Tests: Component Flow

## Purpose
End-to-end tests for component creation and management.

---

## Inputs
- Playwright test framework
- Running application

## Outputs
- Component flow E2E tests

---

## Dependencies
- Phase 3 must be complete

---

## Implementation Notes

```typescript
// tests/e2e/component-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Component Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components');
  });

  test('should create component manually', async ({ page }) => {
    // Open add dropdown
    await page.click('button:has-text("Add Component")');
    await page.click('text=Create Manually');
    
    // Step 1: Basic Info
    await page.fill('input[name="name"]', 'TestButton');
    await page.selectOption('select[name="category"]', 'buttons');
    await page.fill('textarea[name="description"]', 'A test button');
    await page.click('button:has-text("Next")');
    
    // Step 2: Props
    await page.click('button:has-text("Add Prop")');
    await page.fill('.prop-row >> nth=0 >> input >> nth=0', 'variant');
    await page.selectOption('.prop-row >> nth=0 >> select', 'enum');
    await page.fill('.prop-row >> nth=0 >> input[placeholder*="opt"]', 'primary, secondary');
    await page.click('button:has-text("Next")');
    
    // Step 3: Variants
    await page.click('button:has-text("Add Variant")');
    await page.fill('.variant-card >> nth=0 >> input', 'Primary');
    await page.click('button:has-text("Next")');
    
    // Step 4: Token Linking
    await page.click('.token-item >> nth=0'); // Select first token
    await page.click('button:has-text("Create Component")');
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/\/components\/[\w-]+/);
    await expect(page.locator('h1')).toContainText('TestButton');
  });

  test('should generate component with AI', async ({ page }) => {
    await page.click('button:has-text("Add Component")');
    await page.click('text=Generate with AI');
    
    // Fill description
    await page.fill('textarea', 'A primary button with hover effect and loading state');
    await page.selectOption('select[name="category"]', 'buttons');
    
    // Generate
    await page.click('button:has-text("Generate")');
    
    // Wait for generation (may take time)
    await expect(page.locator('.code-preview')).toBeVisible({ timeout: 60000 });
    
    // Accept
    await page.click('button:has-text("Accept")');
    
    // Should create component
    await expect(page).toHaveURL(/\/components\/[\w-]+/);
  });

  test('should filter components by category', async ({ page }) => {
    // Select buttons category
    await page.selectOption('select >> nth=1', 'buttons');
    
    // All visible cards should be buttons category
    const categories = await page.locator('.component-card .category-tag').allTextContents();
    categories.forEach(cat => {
      expect(cat.toLowerCase()).toBe('buttons');
    });
  });

  test('should search components', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'button');
    
    // Wait for filter
    await page.waitForTimeout(300);
    
    // Results should contain search term
    const names = await page.locator('.component-card h3').allTextContents();
    names.forEach(name => {
      expect(name.toLowerCase()).toContain('button');
    });
  });
});

test.describe('Component Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components');
    await page.click('.component-card >> nth=0');
  });

  test('should show preview with prop controls', async ({ page }) => {
    await expect(page.locator('.preview-tab')).toBeVisible();
    
    // Find prop controls
    const controls = page.locator('.prop-controls');
    await expect(controls).toBeVisible();
  });

  test('should edit code in Monaco editor', async ({ page }) => {
    await page.click('button:has-text("Code")');
    
    // Monaco editor should be visible
    await expect(page.locator('.monaco-editor')).toBeVisible();
  });

  test('should add usage example', async ({ page }) => {
    await page.click('button:has-text("Examples")');
    
    const initialCount = await page.locator('.example-card').count();
    
    await page.click('button:has-text("Add Example")');
    await page.fill('input[name="title"]', 'Basic Usage');
    await page.fill('textarea[name="code"]', '<Button>Click me</Button>');
    await page.click('button:has-text("Add Example")');
    
    await expect(page.locator('.example-card')).toHaveCount(initialCount + 1);
  });

  test('should publish component', async ({ page }) => {
    // Only if draft
    const publishButton = page.locator('button:has-text("Publish")');
    if (await publishButton.isVisible()) {
      await publishButton.click();
      await expect(page.locator('.status-badge')).toContainText('published');
    }
  });

  test('should delete component with confirmation', async ({ page }) => {
    await page.click('button:has-text("Delete")');
    
    // Confirm in dialog
    await page.click('.dialog button:has-text("Delete")');
    
    // Should navigate back to list
    await expect(page).toHaveURL('/components');
  });
});

test.describe('Component AI Features', () => {
  test('should regenerate component code', async ({ page }) => {
    await page.goto('/components');
    await page.click('.component-card >> nth=0');
    await page.click('button:has-text("Code")');
    
    const initialCode = await page.locator('.monaco-editor').textContent();
    
    await page.click('button:has-text("Regenerate")');
    await page.fill('textarea[name="instructions"]', 'Add a loading spinner');
    await page.click('button:has-text("Generate")');
    
    // Wait for generation
    await expect(page.locator('.code-preview')).toBeVisible({ timeout: 60000 });
  });
});
```

---

## Files Created
- `tests/e2e/component-flow.spec.ts` — Component E2E tests

---

## Tests

### Verification
- [ ] All component tests pass
- [ ] AI generation test handles timeout
- [ ] No flaky tests
- [ ] Monaco editor interactions work

---

## Time Estimate
3 hours
