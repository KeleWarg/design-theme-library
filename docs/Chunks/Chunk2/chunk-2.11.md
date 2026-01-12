# Chunk 2.11 — Import Integration

## Purpose
Wire up the complete import flow and add completion step.

---

## Inputs
- All import step components (chunk 2.07-2.10)
- tokenService (from chunk 1.08)
- themeService (from chunk 1.07)

## Outputs
- Complete working import flow
- Success state with navigation

---

## Dependencies
- Chunks 2.07-2.10 must be complete
- Chunk 1.08 must be complete

---

## Implementation Notes

### Complete Step

```jsx
// src/components/themes/import/CompleteStep.jsx
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from 'lucide-react';
import { Button } from '../../ui';

export default function CompleteStep({ data }) {
  const navigate = useNavigate();

  return (
    <div className="complete-step">
      <div className="success-animation">
        <CheckCircleIcon className="success-icon" size={64} />
      </div>
      
      <h2>Import Complete!</h2>
      <p>
        Successfully imported <strong>{data.parsedTokens.length} tokens</strong> to{' '}
        <strong>{data.themeName}</strong>
      </p>

      <div className="next-actions">
        <Button onClick={() => navigate(`/themes/${data.themeId}/edit`)}>
          Edit Theme
        </Button>
        <Button variant="ghost" onClick={() => navigate('/themes')}>
          Back to Themes
        </Button>
      </div>
    </div>
  );
}
```

### Page Wrapper

```jsx
// src/pages/ImportWizardPage.jsx
import { ThemeProvider } from '../contexts/ThemeContext';
import ImportWizard from '../components/themes/import/ImportWizard';

export default function ImportWizardPage() {
  return (
    <div className="page import-wizard-page">
      <ImportWizard />
    </div>
  );
}
```

### Route Setup
```jsx
// Add to App.jsx routes
<Route path="/themes/import" element={<ImportWizardPage />} />
```

---

## Files Created
- `src/components/themes/import/CompleteStep.jsx` — Success step
- `src/pages/ImportWizardPage.jsx` — Page wrapper
- `src/styles/import-steps.css` — Step styles

---

## Tests

### Integration Tests
- [ ] Full flow from upload to complete works
- [ ] Tokens appear in database after import
- [ ] Theme appears in theme list
- [ ] Navigation to editor works
- [ ] Back to themes works
- [ ] Cancel at any step returns to themes

### E2E Test
```javascript
// tests/e2e/import-flow.spec.js
test('completes full import flow', async ({ page }) => {
  await page.goto('/themes/import');
  
  // Upload file
  await page.setInputFiles('input[type="file"]', 'fixtures/sample-tokens.json');
  
  // Wait for parsing and proceed
  await page.click('text=Continue');
  
  // Mapping step - just continue
  await page.click('text=Continue to Review');
  
  // Review step - import
  await page.fill('input[name="themeName"]', 'Test Import');
  await page.click('text=Import');
  
  // Should show success
  await expect(page.locator('text=Import Complete')).toBeVisible();
});
```

---

## Time Estimate
2 hours

---

## Notes
This chunk ties together all import components and ensures the flow works end-to-end. The E2E test is critical for validating the complete user journey.
