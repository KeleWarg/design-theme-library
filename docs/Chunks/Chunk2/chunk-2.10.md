# Chunk 2.10 — ReviewStep

## Purpose
Final review before importing tokens to database.

---

## Inputs
- Mapped tokens from MappingStep

## Outputs
- Import confirmation
- Theme name input
- Preview of what will be created

---

## Dependencies
- Chunk 2.09 must be complete

---

## Implementation Notes

### Component Structure

```jsx
// src/components/themes/import/ReviewStep.jsx
import { useState, useMemo } from 'react';
import { themeService } from '../../../services/themeService';
import { tokenService } from '../../../services/tokenService';
import { tokenToCssValue } from '../../../lib/cssVariableInjector';
import { Input, Button } from '../../ui';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';

export default function ReviewStep({ data, onUpdate, onNext, onBack }) {
  const [themeName, setThemeName] = useState(data.themeName || 'Imported Theme');
  const [isImporting, setIsImporting] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts = {};
    data.parsedTokens.forEach(token => {
      const cat = data.mappings[token.path] || token.category;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [data.parsedTokens, data.mappings]);

  const cssPreview = useMemo(() => {
    return data.parsedTokens.slice(0, 5).map(token => 
      `${token.css_variable}: ${tokenToCssValue(token)};`
    ).join('\n');
  }, [data.parsedTokens]);

  const handleImport = async () => {
    if (!themeName.trim()) return;
    
    setIsImporting(true);
    
    try {
      // Create theme if not already created
      let themeId = data.themeId;
      if (!themeId) {
        const theme = await themeService.createTheme({
          name: themeName.trim(),
          source: 'import'
        });
        themeId = theme.id;
      } else {
        // Update theme name if changed
        await themeService.updateTheme(themeId, { name: themeName.trim() });
      }

      // Prepare tokens with final mappings
      const tokensToImport = data.parsedTokens.map(token => ({
        name: token.name,
        path: token.path,
        category: data.mappings[token.path] || token.category,
        type: token.type,
        value: token.value,
        css_variable: token.css_variable,
        description: token.description
      }));

      // Bulk create tokens
      await tokenService.bulkCreateTokens(themeId, tokensToImport);

      onUpdate({ themeId, themeName: themeName.trim() });
      toast.success(`Imported ${tokensToImport.length} tokens`);
      onNext();
    } catch (error) {
      toast.error('Failed to import tokens: ' + error.message);
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="review-step">
      <div className="review-summary">
        <h3>Ready to Import</h3>
        
        <div className="summary-card">
          <Input
            label="Theme Name"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            maxLength={50}
            required
          />
        </div>

        <div className="summary-card">
          <h4>Token Summary</h4>
          <div className="summary-grid">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <div key={cat} className="summary-item">
                <span className={cn('category-dot', cat)} />
                <span className="category-name">{cat}</span>
                <span className="count">{count}</span>
              </div>
            ))}
          </div>
          <div className="total">
            Total: {data.parsedTokens.length} tokens
          </div>
        </div>

        <div className="summary-card">
          <h4>CSS Variables Preview</h4>
          <pre className="css-preview">
            {cssPreview}
            {data.parsedTokens.length > 5 && 
              `\n/* ... and ${data.parsedTokens.length - 5} more */`
            }
          </pre>
        </div>
      </div>

      <div className="step-actions">
        <Button variant="ghost" onClick={onBack} disabled={isImporting}>
          Back
        </Button>
        <Button 
          onClick={handleImport} 
          loading={isImporting}
          disabled={!themeName.trim()}
        >
          Import {data.parsedTokens.length} Tokens
        </Button>
      </div>
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/import/ReviewStep.jsx` — Review step component

---

## Tests

### Unit Tests
- [ ] Shows token counts by category
- [ ] Theme name input works
- [ ] CSS preview shows first 5 tokens
- [ ] Import button disabled without name
- [ ] Import calls services correctly
- [ ] Loading state during import
- [ ] Error handling shows toast

---

## Time Estimate
2 hours

---

## Notes
This is the final confirmation before import. Users can still go back to adjust mappings if needed. The CSS preview helps verify the import will produce expected output.
