# Getting Started with Cursor

## 1. Project Setup (10 min)

```bash
# Create new project folder
mkdir design-system-admin
cd design-system-admin

# Copy docs + chunks from your planning folder
# Your structure should look like:
#   design-system-admin/
#   ├── 01-PROBLEM-STATEMENT.md
#   ├── 02-RESEARCH-FOUNDATION.md
#   ├── 03-ARCHITECTURE.md
#   ├── 04-CONFIG-REFERENCE.md
#   └── Chunks/
#       ├── 00-CHUNK-INDEX.md
#       ├── Chunk0/ (optional)
#       ├── Chunk1/
#       ├── Chunk2/
#       ...

# Run bootstrap (or do manually)
./bootstrap.sh
```

## 2. Set Up Supabase (5 min)

1. Create project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local`
3. Add your Supabase URL and anon key

## 3. Add Cursor Rules

```bash
mkdir -p .cursor/rules
cp automation/cursor-rules.mdc .cursor/rules/
```

## 4. Start Cursor

Open project in Cursor, then paste first prompt:

```
Implement chunk 1.01 (Supabase Setup).
Read: Chunks/Chunk1/chunk-1.01.md
Create src/lib/supabase.js
```

---

## First Prompts (Phase 1)

### 1.01 - Supabase Client
```
Implement chunk 1.01 (Supabase Setup).
Read: Chunks/Chunk1/chunk-1.01.md
Create src/lib/supabase.js
```

### 1.02 - Database Schema
```
Implement chunk 1.02 (Schema - Themes & Tokens).
Read: Chunks/Chunk1/chunk-1.02.md
Create the SQL migration file.
```

### 1.11 - App Shell (can run parallel)
```
Implement chunk 1.11 (App Shell & Routing).
Read: Chunks/Chunk1/chunk-1.11.md
Create Layout, Header, Sidebar, and route pages.
```

### 1.07 - Theme Service
```
Implement chunk 1.07 (Theme Service).
Read: Chunks/Chunk1/chunk-1.07.md
Create src/services/themeService.js with CRUD functions.
```

### 1.08 - Token Service
```
Implement chunk 1.08 (Token Service).
Read: Chunks/Chunk1/chunk-1.08.md
Create src/services/tokenService.js
```

### 1.12 - Token Parser (can run parallel)
```
Implement chunk 1.12 (Token Parser).
Read: Chunks/Chunk1/chunk-1.12.md
Create src/lib/tokenParser.js
Handle Figma Variables JSON format.
```

---

## After Phase 1: Check Gate

```
Verify Gate 1:
- [ ] supabase.js connects successfully
- [ ] All tables created in Supabase
- [ ] themeService.getThemes() returns data
- [ ] tokenService.getTokensByTheme() returns grouped tokens
- [ ] App renders with navigation
```

Then continue to Phase 2 chunks in Chunks/Chunk2/.

---

## Multi-Agent Setup (3 Composers)

### Agent A: Data Layer
```
Implement in order: 1.01 → 1.02 → 1.07 → 1.08 → 2.04
Read specs in Chunks/Chunk1/ and Chunks/Chunk2/
Say "✅ CHUNK X.XX COMPLETE" after each.
```

### Agent B: UI Layer
```
Implement in order: 1.11 → 2.01 → 2.02 → 2.03 → 2.12 → 2.14
Read specs in Chunks/Chunk1/ and Chunks/Chunk2/
Wait for 1.07 before 2.01.
```

### Agent C: Import Flow
```
Implement in order: 1.12 → 2.07 → 2.08 → 2.09 → 2.10 → 2.11
Read specs in Chunks/Chunk1/ and Chunks/Chunk2/
```

---

## Tracking Progress

Update `Chunks/00-CHUNK-INDEX.md` as you complete each chunk:
- Change ⬜ to ✅ when done
- Check gate boxes before starting next phase
