# Chunk 1.01 — Supabase Project Setup

## Purpose
Initialize Supabase project with proper configuration for the Design System Admin tool.

---

## Inputs
- None (fresh Supabase project)

## Outputs
- Supabase project URL and keys (consumed by all services)
- Configured project settings
- Environment variables template

---

## Dependencies
- Phase 0 GO decision

---

## Implementation Notes

### Key Considerations
- Create new project (not reuse existing)
- Disable email confirmation for development
- Configure storage settings for fonts/images
- NO RLS policies (auth deferred)

### Gotchas
- Project creation takes 1-2 minutes
- Save anon key and service role key separately
- Storage bucket policies default to restrictive

### Steps
1. Create new Supabase project
2. Note project URL, anon key, service role key
3. Configure Auth settings (disable email confirm)
4. Create `.env.local` template
5. Initialize Supabase client in codebase

### Supabase Client Setup
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Environment Template
```bash
# .env.local.example
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLAUDE_API_KEY=your-claude-api-key
```

---

## Files Created
- `.env.local.example` — Environment template
- `src/lib/supabase.js` — Supabase client initialization

---

## Tests

### Verification
- [ ] Can connect to Supabase from app
- [ ] Environment variables loaded correctly
- [ ] Supabase dashboard accessible

---

## Time Estimate
1 hour

---

## Notes
This is the foundation for all database operations. Ensure project region is close to target users for latency. Free tier is sufficient for development.
