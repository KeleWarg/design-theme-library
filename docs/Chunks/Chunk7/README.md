# Phase 7 Visual QA Agent — Overnight Build

## Quick Start

```bash
chmod +x run.sh
./run.sh
```

Check `logs/` folder in the morning.

---

## What This Does

Builds the Visual QA Agent in ~3-4 hours using parallel Claude agents:

```
WAVE 1 (parallel):
├── Track A: Input Layer (7.01-7.06)
├── Track B: UI Shell (7.17-7.19)  
└── Track C: Extraction (7.07-7.11)
       ↓
    BUILD CHECK
       ↓
WAVE 2 (parallel):
├── Track D: Matching (7.12-7.16)
└── Track E: Viewer (7.20-7.24)
       ↓
    BUILD CHECK
       ↓
WAVE 3:
└── Track F: Comparison (7.25-7.28)
       ↓
    INTEGRATION AUDIT
```

---

## Requirements

- `claude` CLI installed
- Node.js project with `npm run build` working
- Git initialized

---

## Files Created

After completion:

```
src/
├── components/qa/
│   ├── input/          # ImageDropzone, UrlInput
│   ├── viewer/         # AnnotatedImageViewer, Markers, Tooltip
│   ├── issues/         # IssueLog, IssueItem
│   └── comparison/     # SplitViewer, ComparisonWorkspace
├── lib/qa/
│   ├── extraction/     # colorExtractor, regionDetector
│   ├── matching/       # colorMatcher, deltaE
│   └── issues/         # issueGenerator, markerClusterer
├── services/           # screenshotService, figmaService
├── stores/             # qaStore
└── pages/              # QAPage
```

---

## Logs

Each track writes to its own log:

```
logs/phase7-TIMESTAMP/
├── track-A-Input.log
├── track-B-UIShell.log
├── track-C-Extraction.log
├── track-D-Matching.log
├── track-E-Viewer.log
├── track-F-Comparison.log
└── integration-audit.log
```

---

## If Something Fails

Check the failing track's log:

```bash
tail -100 logs/phase7-*/track-D-Matching.log
```

Resume manually:

```bash
claude --dangerously-skip-permissions -p "
Continue implementing chunk 7.14 from docs/phase-7/chunk-7.07-7.16.md
Build command: npm run build
"
```

---

## Spec Files

- `docs/phase-7/chunk-7.01-7.06.md` — Input Layer
- `docs/phase-7/chunk-7.07-7.16.md` — Extraction + Matching
- `docs/phase-7/chunk-7.17-7.28.md` — UI + Comparison

Each contains complete implementation code that Claude can copy and adapt.
