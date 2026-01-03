# Phase 1 — Foundation

## Overview
Establish database schema, service layer, and application shell for the Design System Admin tool.

---

## Phase Objective
Create the complete data infrastructure and basic application structure that all subsequent phases build upon.

---

## Chunks

| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| [1.01](chunk-1.01.md) | Supabase Project Setup | 1h | Phase 0 GO |
| [1.02](chunk-1.02.md) | Schema - Themes & Tokens | 2h | 1.01 |
| [1.03](chunk-1.03.md) | Schema - Typography | 2h | 1.01 |
| [1.04](chunk-1.04.md) | Schema - Components | 2h | 1.01 |
| [1.05](chunk-1.05.md) | Storage Buckets | 1h | 1.01 |
| [1.06](chunk-1.06.md) | Seed Data | 2h | 1.02, 1.03, 1.04 |
| [1.07](chunk-1.07.md) | Theme Service | 3h | 1.02 |
| [1.08](chunk-1.08.md) | Token Service | 2h | 1.02 |
| [1.09](chunk-1.09.md) | Typeface Service | 2h | 1.03, 1.05 |
| [1.10](chunk-1.10.md) | Component Service | 2h | 1.04 |
| [1.11](chunk-1.11.md) | App Shell & Routing | 3h | None |
| [1.12](chunk-1.12.md) | Token Parser | 2h | None |

**Total: 24 hours**

---

## Parallelization

```
Group A (Database):           Group B (Services):         Group C (App):
┌─────────┐                                               ┌─────────┐
│  1.01   │                                               │  1.11   │
│ 1 hour  │                                               │ 3 hours │
└────┬────┘                                               └─────────┘
     │
     ├─────────┬─────────┬─────────┐                      ┌─────────┐
     ▼         ▼         ▼         ▼                      │  1.12   │
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │ 2 hours │
│  1.02   │ │  1.03   │ │  1.04   │ │  1.05   │          └─────────┘
│ 2 hours │ │ 2 hours │ │ 2 hours │ │ 1 hour  │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │           │           │           │
     │           └─────┬─────┘           │
     │                 ▼                 │
     │           ┌─────────┐             │
     │           │  1.06   │             │
     │           │ 2 hours │             │
     │           └─────────┘             │
     │                                   │
     ├─────────────────┬─────────────────┤
     ▼                 ▼                 ▼
┌─────────┐      ┌─────────┐      ┌─────────┐
│  1.07   │      │  1.09   │      │  1.10   │
│ 3 hours │      │ 2 hours │      │ 2 hours │
└────┬────┘      └─────────┘      └─────────┘
     │
     ▼
┌─────────┐
│  1.08   │
│ 2 hours │
└─────────┘
```

**With parallelization: ~14 hours** (3 parallel tracks)

---

## Gate Checkpoint

### Entry Criteria
- Phase 0 GO decision documented
- Supabase account ready
- Development environment set up (Node.js, npm)

### Exit Criteria
- [ ] All 8 database tables created
- [ ] Storage buckets configured
- [ ] Seed data populates successfully
- [ ] All 4 services return expected data shapes
- [ ] App shell renders with working navigation
- [ ] Token parser handles Figma Variables JSON

### Verification Tests
```bash
# Database
npm run test:db

# Services
npm run test:services

# App renders
npm run dev
# Navigate to all routes
```

---

## Key Deliverables

### Database Tables
| Table | Purpose |
|-------|---------|
| themes | Theme metadata |
| tokens | Design tokens (color, spacing, etc.) |
| typefaces | Font family configurations |
| font_files | Uploaded font files |
| typography_roles | Semantic typography mapping |
| components | Component definitions |
| component_images | Component screenshots |
| component_examples | Usage examples |

### Services
| Service | Consumers |
|---------|-----------|
| themeService | Phase 2 (CRUD, context) |
| tokenService | Phase 2 (editors, import) |
| typefaceService | Phase 2 (typography) |
| componentService | Phase 3 (components) |

### Application Structure
```
src/
├── lib/
│   ├── supabase.js       # Supabase client
│   ├── storage.js        # Storage helpers
│   └── tokenParser.js    # Token parsing
├── services/
│   ├── themeService.js
│   ├── tokenService.js
│   ├── typefaceService.js
│   └── componentService.js
├── components/
│   └── layout/
│       ├── Layout.jsx
│       ├── Header.jsx
│       └── Sidebar.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── ThemesPage.jsx
│   ├── ComponentsPage.jsx
│   └── SettingsPage.jsx
└── App.jsx
```

---

## Database Entity Relationships

```
themes
  │
  ├── tokens (1:N)
  │
  ├── typefaces (1:N)
  │     └── font_files (1:N)
  │
  └── typography_roles (1:N)

components (independent)
  ├── component_images (1:N)
  └── component_examples (1:N)
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Schema changes later | Use JSONB for flexible fields |
| Storage quota limits | Set file size limits, document limits |
| Service coupling | Keep services independent, clear interfaces |
| Routing complexity | Start with flat routes, add nesting later |

---

## Notes
- NO authentication in this phase (deferred)
- All storage buckets are public (will need auth policies later)
- Services use consistent error handling pattern
- Token parser is critical for Phase 2 import flow
