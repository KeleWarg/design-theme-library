# Chunk 1.03 — Database Schema - Typography

## Purpose
Create database tables for typefaces, font files, and typography roles.

---

## Inputs
- Supabase project (from chunk 1.01)

## Outputs
- `typefaces` table (consumed by chunk 1.09)
- `font_files` table (consumed by chunk 1.09)
- `typography_roles` table (consumed by chunk 1.09)

---

## Dependencies
- Chunk 1.01 must be complete

---

## Implementation Notes

### Key Considerations
- One typeface per role per theme (enforced by unique constraint)
- Font files linked to typefaces
- Typography roles link to both theme and typeface role

### Schema

```sql
-- Typefaces
CREATE TABLE typefaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('display', 'text', 'mono', 'accent')),
  family VARCHAR(100) NOT NULL,
  fallback VARCHAR(255) DEFAULT 'sans-serif',
  source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('google', 'adobe', 'system', 'custom')),
  weights JSONB DEFAULT '[400]',
  is_variable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(theme_id, role)
);

-- Font Files
CREATE TABLE font_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  typeface_id UUID NOT NULL REFERENCES typefaces(id) ON DELETE CASCADE,
  storage_path VARCHAR(500) NOT NULL,
  format VARCHAR(10) NOT NULL CHECK (format IN ('woff2', 'woff', 'ttf', 'otf')),
  weight INTEGER NOT NULL,
  style VARCHAR(20) DEFAULT 'normal' CHECK (style IN ('normal', 'italic')),
  file_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Typography Roles (semantic mapping)
CREATE TABLE typography_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  role_name VARCHAR(50) NOT NULL,
  typeface_role VARCHAR(20) NOT NULL CHECK (typeface_role IN ('display', 'text', 'mono', 'accent')),
  font_size VARCHAR(20) NOT NULL,
  font_weight INTEGER NOT NULL DEFAULT 400,
  line_height VARCHAR(20) DEFAULT '1.5',
  letter_spacing VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(theme_id, role_name)
);

-- Indexes
CREATE INDEX idx_typefaces_theme ON typefaces(theme_id);
CREATE INDEX idx_font_files_typeface ON font_files(typeface_id);
CREATE INDEX idx_typography_roles_theme ON typography_roles(theme_id);
```

### Typeface Roles
| Role | Purpose | Typical Use |
|------|---------|-------------|
| display | Headlines, hero text | Large, impactful headings |
| text | Body copy | Readable at small sizes |
| mono | Code, technical | Fixed-width characters |
| accent | Special callouts | Decorative, limited use |

### Predefined Typography Role Names
- display
- heading-xl
- heading-lg
- heading-md
- heading-sm
- body-lg
- body-md
- body-sm
- label
- caption
- mono

---

## Files Created
- `supabase/migrations/002_typography.sql` — Migration file

---

## Tests

### Unit Tests
- [ ] Can create typeface with theme
- [ ] Unique constraint on (theme_id, role) works
- [ ] Can create font file linked to typeface
- [ ] Can create typography role
- [ ] Cascade delete from theme removes all

### Verification
- [ ] Tables visible in Supabase dashboard
- [ ] Foreign keys work correctly

---

## Time Estimate
2 hours

---

## Notes
Typography is one of the most complex areas - it needs to handle Google Fonts, Adobe Fonts, system fonts, and custom uploads. The 4-role system (display/text/mono/accent) simplifies font selection while maintaining flexibility.
