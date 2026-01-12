# Chunk 2.22 — TypefaceForm

## Purpose
Form for adding/editing typefaces with source selection.

---

## Inputs
- TypefaceManager (from chunk 2.21)
- typefaceService (from chunk 1.09)

## Outputs
- TypefaceForm modal component

---

## Dependencies
- Chunk 2.21 must be complete

---

## Implementation Notes

### Source Types
| Source | Description | Implementation |
|--------|-------------|----------------|
| google | Google Fonts | Search API + link injection |
| adobe | Adobe Fonts | Manual entry |
| system | System fonts | Predefined list |
| custom | Upload files | woff2/woff/ttf/otf upload |

### Component Structure

```jsx
// src/components/themes/typography/TypefaceForm.jsx
export default function TypefaceForm({ typeface, themeId, availableRoles, onClose, onSave }) {
  const [formData, setFormData] = useState({
    role: typeface?.role || availableRoles[0],
    family: typeface?.family || '',
    fallback: typeface?.fallback || 'sans-serif',
    source_type: typeface?.source_type || 'google',
    weights: typeface?.weights || [400],
    is_variable: typeface?.is_variable || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (typeface?.id) {
        await typefaceService.updateTypeface(typeface.id, formData);
      } else {
        await typefaceService.createTypeface({ ...formData, theme_id: themeId });
      }
      onSave();
    } catch (error) {
      toast.error('Failed to save typeface');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={typeface?.id ? 'Edit Typeface' : 'Add Typeface'}>
      <form onSubmit={handleSubmit}>
        <Select
          label="Role"
          value={formData.role}
          onChange={(role) => setFormData({ ...formData, role })}
          options={availableRoles.map(r => ({ value: r, label: capitalize(r) }))}
          disabled={!!typeface?.id}
        />

        <Select
          label="Source"
          value={formData.source_type}
          onChange={(source_type) => setFormData({ ...formData, source_type, family: '' })}
          options={[
            { value: 'google', label: 'Google Fonts' },
            { value: 'adobe', label: 'Adobe Fonts' },
            { value: 'system', label: 'System Font' },
            { value: 'custom', label: 'Custom (Upload)' },
          ]}
        />

        <SourceSpecificFields
          sourceType={formData.source_type}
          family={formData.family}
          weights={formData.weights}
          onChange={(updates) => setFormData({ ...formData, ...updates })}
        />

        <Input
          label="Fallback Stack"
          value={formData.fallback}
          onChange={(e) => setFormData({ ...formData, fallback: e.target.value })}
          placeholder="sans-serif"
        />

        <WeightSelector
          selected={formData.weights}
          available={formData.source_type === 'google' ? getAvailableWeights(formData.family) : null}
          onChange={(weights) => setFormData({ ...formData, weights })}
        />

        <div className="form-actions">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>
            {typeface?.id ? 'Save' : 'Add'} Typeface
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

### Google Font Search
```jsx
function GoogleFontSearch({ value, onChange }) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchFonts = useDebouncedCallback(async (q) => {
    if (!q) return;
    setIsSearching(true);
    const fonts = await searchGoogleFonts(q);
    setResults(fonts);
    setIsSearching(false);
  }, 300);

  return (
    <div className="google-font-search">
      <Input
        label="Search Google Fonts"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          searchFonts(e.target.value);
        }}
        placeholder="e.g., Inter, Roboto..."
      />
      {results.length > 0 && (
        <div className="search-results">
          {results.map(font => (
            <button
              key={font.family}
              className="font-result"
              onClick={() => onChange(font.family, font.variants)}
            >
              <span style={{ fontFamily: font.family }}>{font.family}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/typography/TypefaceForm.jsx` — Form modal
- `src/components/themes/typography/GoogleFontSearch.jsx` — Google Fonts search
- `src/components/themes/typography/WeightSelector.jsx` — Weight selection
- `src/lib/googleFonts.js` — Google Fonts API utilities

---

## Tests

### Unit Tests
- [ ] Role selection works
- [ ] Source type switches fields
- [ ] Google Fonts search works
- [ ] System fonts list shows
- [ ] Weight selector works
- [ ] Form submits correctly

---

## Time Estimate
3 hours

---

## Notes
The form adapts based on source type. Google Fonts integration uses the Google Fonts API for search and available weights.
