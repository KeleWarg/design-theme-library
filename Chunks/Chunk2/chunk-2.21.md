# Chunk 2.21 — TypefaceManager

## Purpose
Manage typefaces (font families) assigned to semantic roles in a theme.

---

## Inputs
- typefaceService (from chunk 1.09)
- Theme context

## Outputs
- TypefaceManager component (consumed by ThemeEditor)
- Typeface CRUD UI

---

## Dependencies
- Chunk 1.09 must be complete

---

## Implementation Notes

### Typeface Roles
| Role | Purpose | Typical Use |
|------|---------|-------------|
| display | Headlines, hero text | Impact, large sizes |
| text | Body copy, paragraphs | Readability |
| mono | Code, technical | Fixed-width |
| accent | Special callouts | Decorative |

### Component Structure

```jsx
// src/components/themes/typography/TypefaceManager.jsx
export default function TypefaceManager({ themeId }) {
  const { data: typefaces, refetch } = useTypefaces(themeId);
  const [editingTypeface, setEditingTypeface] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const roles = ['display', 'text', 'mono', 'accent'];
  const assignedRoles = new Set(typefaces?.map(t => t.role) || []);

  const handleDelete = async (id) => {
    if (!confirm('Remove this typeface?')) return;
    await typefaceService.deleteTypeface(id);
    refetch();
  };

  return (
    <div className="typeface-manager">
      <div className="section-header">
        <h3>Typefaces</h3>
        <Button 
          size="sm" 
          onClick={() => setShowAddForm(true)}
          disabled={assignedRoles.size >= 4}
        >
          Add Typeface
        </Button>
      </div>

      <div className="typeface-grid">
        {roles.map(role => {
          const typeface = typefaces?.find(t => t.role === role);
          return (
            <TypefaceCard
              key={role}
              role={role}
              typeface={typeface}
              onEdit={() => setEditingTypeface(typeface || { role })}
              onDelete={() => handleDelete(typeface?.id)}
            />
          );
        })}
      </div>

      {(showAddForm || editingTypeface) && (
        <TypefaceFormModal
          typeface={editingTypeface}
          themeId={themeId}
          availableRoles={roles.filter(r => !assignedRoles.has(r) || r === editingTypeface?.role)}
          onClose={() => {
            setShowAddForm(false);
            setEditingTypeface(null);
          }}
          onSave={() => {
            refetch();
            setShowAddForm(false);
            setEditingTypeface(null);
          }}
        />
      )}
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/typography/TypefaceManager.jsx` — Manager component
- `src/components/themes/typography/TypefaceCard.jsx` — Individual card
- `src/hooks/useTypefaces.js` — Data fetching hook

---

## Tests

### Unit Tests
- [ ] Shows all 4 role slots
- [ ] Shows assigned typefaces
- [ ] Empty state for unassigned roles
- [ ] Edit opens modal
- [ ] Delete removes typeface

---

## Time Estimate
3 hours

---

## Notes
Each theme has up to 4 typefaces (one per role). The grid layout makes it easy to see which roles are assigned and which need fonts.
