# Integration Testing Checklist

**Chunk:** 4.05 - Plugin Integration Testing

This document provides a manual testing checklist for the Figma plugin integration flow.

---

## Setup

- [ ] Plugin loads in Figma
- [ ] UI displays correctly
- [ ] No console errors on load

---

## Scanning

- [ ] "Scan Document" button finds all components
- [ ] Component count is accurate
- [ ] Variant counts shown correctly for ComponentSets
- [ ] Component names display correctly
- [ ] Empty document shows appropriate message

---

## Selection

- [ ] Individual component selection works
- [ ] Select all checkbox works
- [ ] Deselect individual components works
- [ ] Deselect all works
- [ ] Selection state persists during scan

---

## Export

- [ ] Progress bar updates during extraction (0-50%)
- [ ] Components extracted successfully
- [ ] Images exported correctly (PNG for components, SVG for vectors)
- [ ] Preview images generated for all components
- [ ] API receives payload
- [ ] Success message shown after export
- [ ] Error messages display if export fails

---

## Error Cases

- [ ] Invalid API URL shows error message
- [ ] Network errors trigger retry logic
- [ ] Large payload chunking works (test with 10+ components)
- [ ] Timeout errors handled gracefully
- [ ] Missing components handled gracefully

---

## Component Types

### Simple Component
- [ ] Single component with no variants extracts correctly
- [ ] Metadata (name, description) extracted
- [ ] Preview image exported

### ComponentSet
- [ ] All variants extracted
- [ ] Variant properties parsed correctly
- [ ] Preview images for each variant

### Component with Bound Variables
- [ ] Bound variables found
- [ ] Variable names extracted
- [ ] Collection names extracted

### Component with Images
- [ ] Image fills exported
- [ ] Vector icons exported as SVG
- [ ] All nested images found

### Large Component
- [ ] Deeply nested structures handled
- [ ] No timeout on complex components
- [ ] All children extracted

---

## Batch Export

- [ ] Multiple components export in sequence
- [ ] Progress updates correctly (0-100%)
- [ ] Chunking works for large payloads
- [ ] All components included in final payload

---

## API Communication

- [ ] API URL validated before export
- [ ] Authentication headers included when token provided
- [ ] Payload format matches API expectations
- [ ] Response handling works correctly
- [ ] Error responses displayed to user

---

## Performance

- [ ] Export completes in reasonable time (< 30s for 10 components)
- [ ] No memory leaks during batch export
- [ ] Progress updates don't block UI

---

## Notes

- Test with real Figma files containing:
  - Simple components
  - ComponentSets with variants
  - Components using design tokens (variables)
  - Components with images/icons
  - Deeply nested component structures



