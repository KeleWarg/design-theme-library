# Chunk 1.02 — Database Schema - Themes & Tokens

## Purpose
Create database tables for themes and tokens with proper relationships.

---

## Inputs
- Supabase project (from chunk 1.01)

## Outputs
- `themes` table (consumed by chunk 1.07)
- `tokens` table (consumed by chunk 1.08)
- Indexes for performance

---

## Dependencies
- Chunk 1.01 must be complete

---

## Implementation Notes

### Key Considerations
- Use UUID for all IDs
- JSONB for flexible token values
- Cascade delete from themes to tokens
- Auto-generate slug from name

### Schema

```sql
-- Themes
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_default BOOLEAN DEFAULT false,
  source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'figma', 'import')),
  figma_file_key VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tokens
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  path VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other')),
  type VARCHAR(50) NOT NULL,
  value JSONB NOT NULL,
  css_variable VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(theme_id, path)
);

-- Indexes
CREATE INDEX idx_tokens_theme ON tokens(theme_id);
CREATE INDEX idx_tokens_category ON tokens(category);
CREATE INDEX idx_themes_status ON themes(status);
CREATE INDEX idx_themes_is_default ON themes(is_default);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tokens_updated_at
  BEFORE UPDATE ON tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Token Value Structures
| Category | Type | Value Shape |
|----------|------|-------------|
| color | color | `{ hex, rgb: {r,g,b}, hsl: {h,s,l}, opacity }` |
| typography | dimension | `{ value, unit }` |
| spacing | dimension | `{ value, unit }` |
| shadow | shadow | `{ shadows: [{x, y, blur, spread, color}] }` |
| radius | dimension | `{ value, unit }` |
| grid | object | `{ breakpoints, columns, margin, gutter }` |

### Gotchas
- Ensure slug uniqueness with trigger or application logic
- JSONB queries need proper indexing for performance
- Consider GIN index on value if searching token values

---

## Files Created
- `supabase/migrations/001_themes_tokens.sql` — Migration file

---

## Tests

### Unit Tests
- [ ] Can create theme
- [ ] Can create token with theme_id
- [ ] Cascade delete works (delete theme removes tokens)
- [ ] Unique constraint on theme slug works
- [ ] Unique constraint on (theme_id, path) works

### Verification
- [ ] Tables visible in Supabase dashboard
- [ ] Indexes created correctly

---

## Time Estimate
2 hours

---

## Notes
This is the core schema. All token editors and export generators depend on this structure.
