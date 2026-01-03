# Chunk 0.05 — AI Generation Testing

## Purpose
Test Claude AI generation quality for React components with design token context.

---

## Inputs
- Sample component descriptions
- Sample theme tokens
- Claude API access (claude-sonnet-4-20250514)

## Outputs
- Quality metrics report (consumed by chunk 0.06)
- Refined prompt templates (consumed by chunk 3.11)
- Sample generated components

---

## Dependencies
- None (can run parallel to Figma work)

---

## Implementation Notes

### Key Considerations
- Test with 10 diverse component types
- Measure JSX compilation success rate
- Assess visual accuracy subjectively
- Test with varying token context sizes

### Gotchas
- Model may hallucinate non-existent CSS variables
- May generate class-based instead of functional components
- May not use provided tokens correctly
- Response format may vary

### Test Component Matrix
| # | Component | Complexity | Key Challenge |
|---|-----------|------------|---------------|
| 1 | Button | Low | States (primary, secondary, disabled) |
| 2 | Card | Low | Layout composition |
| 3 | Input | Medium | Label, error state, icons |
| 4 | Avatar | Low | Image + initials fallback |
| 5 | Badge/Tag | Low | Multiple color variants |
| 6 | Alert/Toast | Medium | Icons, dismiss, severity |
| 7 | Modal | High | Portal, overlay, focus trap |
| 8 | Dropdown | High | Position, keyboard nav |
| 9 | Tabs | Medium | Active state, content switching |
| 10 | Accordion | Medium | Expand/collapse animation |

### Metrics to Collect
| Metric | Target | Measurement |
|--------|--------|-------------|
| Compilation success | ≥90% | Valid JSX/TSX |
| Uses provided tokens | ≥80% | CSS variable references |
| React best practices | ≥80% | Hooks, props, etc. |
| Generates proper props | ≥85% | TypeScript interface |

### Prompt Template v1
```markdown
You are a React component generator for a design system.

## Available Design Tokens
{tokens_json}

## Component Request
Name: {name}
Description: {description}
Category: {category}

## Requirements
- Export a functional React component with TypeScript
- Use CSS variables from the provided tokens (--color-*, --space-*, etc.)
- Define a Props interface with JSDoc comments
- Include sensible default prop values
- Component should be self-contained (no external dependencies except React)

## Output Format
Return ONLY the TypeScript/JSX code, no explanation.
```

### Iteration Strategy
1. Run all 10 components with v1 prompt
2. Document failures
3. Refine prompt based on common issues
4. Re-run failed components
5. Repeat until ≥80% pass rate or 3 iterations

---

## Files Created
- `poc/ai-generation/test-runner.js` — Test script
- `poc/ai-generation/prompts/component-prompt.md` — Prompt template
- `poc/ai-generation/results/` — Generated components (10 files)
- `poc/ai-generation/REPORT.md` — Quality metrics

---

## Tests

### Quality Metrics
- [ ] JSX compilation rate ≥80%
- [ ] Token usage rate ≥70%
- [ ] Props generation rate ≥80%

### Verification
- [ ] All 10 components attempted
- [ ] Failures documented with reasons
- [ ] Prompt iterations documented

---

## Time Estimate
4 hours

---

## Notes
This is independent of Figma validation and can run in parallel. Results directly inform the prompt builder in Phase 3 (chunk 3.11). If AI generation fails significantly, manual code editing becomes the primary creation method.
