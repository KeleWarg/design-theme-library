# Chunk 2.24 — TypographyRoleEditor

## Purpose
Configure typography roles (semantic text styles) for a theme.

---

## Inputs
- typefaceService (from chunk 1.09)
- Theme typefaces

## Outputs
- TypographyRoleEditor component
- Typography role CRUD

---

## Dependencies
- Chunk 2.21 must be complete

---

## Implementation Notes

### Semantic Typography Roles (11 total)
| Role | Typeface | Typical Size | Use Case |
|------|----------|--------------|----------|
| display | display | 3rem | Hero headlines |
| heading-xl | display | 2.25rem | Page titles |
| heading-lg | display | 1.875rem | Section headers |
| heading-md | display | 1.5rem | Card headers |
| heading-sm | display | 1.25rem | Subheadings |
| body-lg | text | 1.125rem | Intro paragraphs |
| body-md | text | 1rem | Body copy |
| body-sm | text | 0.875rem | Secondary text |
| label | text | 0.875rem | Form labels |
| caption | text | 0.75rem | Image captions |
| mono | mono | 0.875rem | Code blocks |

### Component Structure

```jsx
// src/components/themes/typography/TypographyRoleEditor.jsx
const ROLE_DEFINITIONS = [
  { name: 'display', typeface: 'display', defaultSize: '3rem', defaultWeight: 700 },
  { name: 'heading-xl', typeface: 'display', defaultSize: '2.25rem', defaultWeight: 700 },
  { name: 'heading-lg', typeface: 'display', defaultSize: '1.875rem', defaultWeight: 600 },
  { name: 'heading-md', typeface: 'display', defaultSize: '1.5rem', defaultWeight: 600 },
  { name: 'heading-sm', typeface: 'display', defaultSize: '1.25rem', defaultWeight: 600 },
  { name: 'body-lg', typeface: 'text', defaultSize: '1.125rem', defaultWeight: 400 },
  { name: 'body-md', typeface: 'text', defaultSize: '1rem', defaultWeight: 400 },
  { name: 'body-sm', typeface: 'text', defaultSize: '0.875rem', defaultWeight: 400 },
  { name: 'label', typeface: 'text', defaultSize: '0.875rem', defaultWeight: 500 },
  { name: 'caption', typeface: 'text', defaultSize: '0.75rem', defaultWeight: 400 },
  { name: 'mono', typeface: 'mono', defaultSize: '0.875rem', defaultWeight: 400 },
];

export default function TypographyRoleEditor({ themeId, typefaces }) {
  const { data: roles, refetch } = useTypographyRoles(themeId);
  const [editingRole, setEditingRole] = useState(null);

  const handleSave = async (roleData) => {
    await typefaceService.upsertTypographyRole(themeId, roleData);
    refetch();
    setEditingRole(null);
  };

  const getTypeface = (typefaceRole) => {
    return typefaces?.find(t => t.role === typefaceRole);
  };

  return (
    <div className="typography-role-editor">
      <div className="section-header">
        <h3>Typography Scale</h3>
        <Button size="sm" onClick={() => handleInitialize()}>
          Reset to Defaults
        </Button>
      </div>

      <div className="role-list">
        {ROLE_DEFINITIONS.map(def => {
          const role = roles?.find(r => r.role_name === def.name);
          const typeface = getTypeface(def.typeface);
          
          return (
            <TypographyRoleRow
              key={def.name}
              definition={def}
              role={role}
              typeface={typeface}
              onEdit={() => setEditingRole(role || def)}
            />
          );
        })}
      </div>

      {editingRole && (
        <TypographyRoleModal
          role={editingRole}
          typefaces={typefaces}
          onClose={() => setEditingRole(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function TypographyRoleRow({ definition, role, typeface, onEdit }) {
  const fontSize = role?.font_size || definition.defaultSize;
  const fontWeight = role?.font_weight || definition.defaultWeight;
  const lineHeight = role?.line_height || '1.5';
  
  return (
    <div className="role-row" onClick={onEdit}>
      <div className="role-name">{definition.name}</div>
      <div 
        className="role-preview"
        style={{
          fontFamily: typeface ? `'${typeface.family}', ${typeface.fallback}` : 'inherit',
          fontSize,
          fontWeight,
          lineHeight
        }}
      >
        The quick brown fox
      </div>
      <div className="role-specs">
        <span>{fontSize}</span>
        <span>{fontWeight}</span>
        <span>{lineHeight}</span>
      </div>
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/typography/TypographyRoleEditor.jsx` — Role editor
- `src/components/themes/typography/TypographyRoleModal.jsx` — Edit modal
- `src/hooks/useTypographyRoles.js` — Data fetching hook

---

## Tests

### Unit Tests
- [ ] Shows all 11 roles
- [ ] Displays role preview with correct font
- [ ] Edit opens modal
- [ ] Save updates role
- [ ] Reset creates defaults

---

## Time Estimate
3 hours

---

## Notes
Typography roles create a consistent type scale. Each role references a typeface role (display/text/mono) for the actual font family.
