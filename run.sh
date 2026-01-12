#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# PHASE 7 VISUAL QA AGENT — OVERNIGHT BUILD
# ═══════════════════════════════════════════════════════════════════
# 
# USAGE:
#   Copy this to your project root, then:
#   chmod +x run.sh && ./run.sh
#
# Check logs/ folder in the morning.
# ═══════════════════════════════════════════════════════════════════

PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_DIR="$PROJECT_DIR/logs/phase7-$TIMESTAMP"
SPEC_DIR="$PROJECT_DIR/docs/Chunks/Chunk7"

mkdir -p "$LOG_DIR"

echo "═══════════════════════════════════════════════════════════════"
echo "PHASE 7: Visual QA Agent — Parallel Build"
echo "Started: $(date)"
echo "Project: $PROJECT_DIR"
echo "Specs:   $SPEC_DIR"
echo "Logs:    $LOG_DIR/"
echo "═══════════════════════════════════════════════════════════════"

cd "$PROJECT_DIR"

# ─────────────────────────────────────────
# HELPER: Run a chunk with retry loop
# ─────────────────────────────────────────
run_chunk() {
  local chunk_id="$1"
  local spec_file="$2"
  local log_file="$3"
  
  echo "" >> "$log_file"
  echo "┌─────────────────────────────────────────" >> "$log_file"
  echo "│ CHUNK $chunk_id — $(date +%H:%M:%S)" >> "$log_file"
  echo "└─────────────────────────────────────────" >> "$log_file"
  
  claude --dangerously-skip-permissions -p "
You are implementing chunk $chunk_id for the Visual QA Agent.

READ THE SPEC FILE FIRST:
\$(cat $spec_file)

Find the section for Chunk $chunk_id and implement ALL requirements.

Create files in:
- src/components/qa/ for React components
- src/lib/qa/ for utilities
- src/services/ for API services
- src/stores/ for Zustand stores
- src/types/ for TypeScript types

VERIFICATION: npm run build

Keep iterating until build passes (max 15 attempts).
When done: <promise>CHUNK_${chunk_id}_DONE</promise>
" >> "$log_file" 2>&1
  
  git add -A && git commit -m "Implement chunk $chunk_id" --allow-empty 2>/dev/null || true
  echo "│ CHUNK $chunk_id complete — $(date +%H:%M:%S)" >> "$log_file"
}

# ─────────────────────────────────────────
# HELPER: Run a track (series of chunks)
# ─────────────────────────────────────────
run_track() {
  local track_name="$1"
  local spec_file="$2"
  local log_file="$LOG_DIR/track-$track_name.log"
  shift 2
  local chunks=("$@")
  
  echo "[$track_name] Starting: ${chunks[*]}" | tee -a "$log_file"
  
  for chunk in "${chunks[@]}"; do
    run_chunk "$chunk" "$spec_file" "$log_file"
  done
  
  echo "[$track_name] COMPLETE" | tee -a "$log_file"
  touch "$LOG_DIR/.track-$track_name-done"
}

# ─────────────────────────────────────────
# HELPER: Gate checkpoint
# ─────────────────────────────────────────
run_gate() {
  local gate_name="$1"
  
  echo ""
  echo "╔═════════════════════════════════════════"
  echo "║ GATE: $gate_name"
  echo "╚═════════════════════════════════════════"
  
  if npm run build 2>&1; then
    echo "✅ GATE $gate_name PASSED"
    git add -A && git commit -m "Gate $gate_name passed" --allow-empty 2>/dev/null || true
    return 0
  else
    echo "❌ Build failed, attempting fixes..."
    claude --dangerously-skip-permissions -p "
npm run build failed after $gate_name.
Run the build, analyze errors, and fix them.
Common issues: missing imports, type errors, undefined references.
Keep iterating until build passes.
"
    npm run build && echo "✅ GATE $gate_name PASSED (after fixes)"
  fi
}

# ═══════════════════════════════════════════════════════════════════
# WAVE 1: Input + UI Shell + Extraction (parallel)
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "▶▶▶ WAVE 1: Starting 3 parallel tracks"
echo ""

run_track "A-Input" "$SPEC_DIR/chunk-7.01-7.06.md" 7.01 7.02 7.03 7.04 7.05 7.06 &
PID_A=$!

run_track "B-UIShell" "$SPEC_DIR/chunk-7.17-7.28.md" 7.17 7.18 7.19 &
PID_B=$!

run_track "C-Extraction" "$SPEC_DIR/chunk-7.07-7.16.md" 7.07 7.08 7.09 7.10 7.11 &
PID_C=$!

echo "  Track A (Input):      PID $PID_A"
echo "  Track B (UI Shell):   PID $PID_B"
echo "  Track C (Extraction): PID $PID_C"
echo ""
echo "Waiting for Wave 1..."

wait $PID_A $PID_B $PID_C
run_gate "Wave1-Input-UIShell-Extraction"

# ═══════════════════════════════════════════════════════════════════
# WAVE 2: Matching + Viewer (parallel)
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "▶▶▶ WAVE 2: Starting 2 parallel tracks"
echo ""

run_track "D-Matching" "$SPEC_DIR/chunk-7.07-7.16.md" 7.12 7.13 7.14 7.15 7.16 &
PID_D=$!

run_track "E-Viewer" "$SPEC_DIR/chunk-7.17-7.28.md" 7.20 7.21 7.22 7.23 7.24 &
PID_E=$!

echo "  Track D (Matching): PID $PID_D"
echo "  Track E (Viewer):   PID $PID_E"
echo ""
echo "Waiting for Wave 2..."

wait $PID_D $PID_E
run_gate "Wave2-Matching-Viewer"

# ═══════════════════════════════════════════════════════════════════
# WAVE 3: Comparison (sequential)
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "▶▶▶ WAVE 3: Comparison track"
echo ""

run_track "F-Comparison" "$SPEC_DIR/chunk-7.17-7.28.md" 7.25 7.26 7.27 7.28
run_gate "Wave3-Comparison"

# ═══════════════════════════════════════════════════════════════════
# FINAL INTEGRATION AUDIT
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "▶▶▶ FINAL INTEGRATION AUDIT"
echo ""

claude --dangerously-skip-permissions -p "
Final integration audit for Phase 7 Visual QA Agent.

VERIFY EACH ITEM:
1. Route /qa exists and loads QAPage
2. ImageDropzone accepts image upload
3. Colors extracted with bounds + centroid
4. Issues generated with marker positions
5. Markers render on AnnotatedImageViewer
6. Click marker → issue highlights in log
7. Click issue → viewer pans to marker
8. Compare mode shows two images side-by-side

For any failing item:
- Identify the missing connection
- Wire it up
- Verify with npm run build

Report: 'AUDIT COMPLETE: X/8 passing'
" | tee "$LOG_DIR/integration-audit.log"

# ═══════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "PHASE 7 BUILD COMPLETE"
echo "Finished: $(date)"
echo ""
echo "TRACK STATUS:"
for track in A-Input B-UIShell C-Extraction D-Matching E-Viewer F-Comparison; do
  [ -f "$LOG_DIR/.track-$track-done" ] && echo "  ✅ $track" || echo "  ❌ $track"
done
echo ""
echo "LOGS: $LOG_DIR/"
echo "═══════════════════════════════════════════════════════════════"
