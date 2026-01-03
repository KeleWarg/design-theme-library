# Chunk 1.04 — Database Schema - Components

## Purpose
Create database tables for components, images, and examples.

---

## Inputs
- Supabase project (from chunk 1.01)

## Outputs
- `components` table (consumed by chunk 1.10)
- `component_images` table (consumed by chunk 1.10)
- `component_examples` table (consumed by chunk 1.10)

---

## Dependencies
- Chunk 1.01 must be complete

---

## Implementation Notes

### Key Considerations
- Components are theme-independent (can work with any theme)
- linked_tokens stores array of token paths, not IDs
- figma_structure stores full extraction for AI context

### Schema

```sql
-- Components
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50) CHECK (category IN (
    'buttons', 'forms', 'layout', 'navigation', 
    'feedback', 'data-display', 'overlay', 'other'
  )),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  code TEXT,
  props JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  linked_tokens JSONB DEFAULT '[]',
  figma_id VARCHAR(100),
  figma_structure JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Component Images
CREATE TABLE component_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  format VARCHAR(10) NOT NULL CHECK (format IN ('png', 'svg', 'jpg', 'webp')),
  width INTEGER,
  height INTEGER,
  file_size INTEGER NOT NULL,
  figma_node_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Component Examples (for LLMS.txt)
CREATE TABLE component_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_components_status ON components(status);
CREATE INDEX idx_components_category ON components(category);
CREATE INDEX idx_component_images_component ON component_images(component_id);
CREATE INDEX idx_component_examples_component ON component_examples(component_id);

-- Updated at trigger
CREATE TRIGGER components_updated_at
  BEFORE UPDATE ON components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Props JSONB Structure
```json
[
  {
    "name": "variant",
    "type": "enum",
    "options": ["primary", "secondary", "ghost"],
    "default": "primary",
    "required": false,
    "description": "Visual variant of the button"
  },
  {
    "name": "disabled",
    "type": "boolean",
    "default": false,
    "required": false,
    "description": "Whether the button is disabled"
  }
]
```

### Variants JSONB Structure
```json
[
  {
    "name": "Primary",
    "props": { "variant": "primary" },
    "description": "Main call-to-action"
  },
  {
    "name": "Secondary",
    "props": { "variant": "secondary" },
    "description": "Less prominent action"
  }
]
```

### Component Categories
| Category | Description |
|----------|-------------|
| buttons | Button, IconButton, ButtonGroup |
| forms | Input, Select, Checkbox, Radio, etc. |
| layout | Card, Container, Grid, Stack |
| navigation | Tabs, Breadcrumb, Pagination |
| feedback | Alert, Toast, Progress, Spinner |
| data-display | Badge, Avatar, Table, List |
| overlay | Modal, Drawer, Popover, Tooltip |
| other | Miscellaneous components |

---

## Files Created
- `supabase/migrations/003_components.sql` — Migration file

---

## Tests

### Unit Tests
- [ ] Can create component
- [ ] Can create component image
- [ ] Can create component example
- [ ] Cascade delete works
- [ ] JSONB props/variants store correctly

### Verification
- [ ] Tables visible in Supabase dashboard

---

## Time Estimate
2 hours

---

## Notes
Components are theme-independent by design. They reference tokens by path (e.g., "color/primary") which allows them to work with any theme that defines those tokens.
