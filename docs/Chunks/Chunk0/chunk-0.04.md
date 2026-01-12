# Chunk 0.04 — Figma Plugin PoC - API Communication

## Purpose
Test calling external API from Figma plugin sandbox.

---

## Inputs
- Plugin with extracted data (from chunk 0.02)
- Test API endpoint

## Outputs
- PluginAPIClient module (consumed by chunk 4.04)
- Documentation of communication patterns
- Working fetch to external endpoint

---

## Dependencies
- Chunk 0.02 must be complete

---

## Implementation Notes

### Key Considerations
- Plugin code runs in sandbox without fetch
- UI code (iframe) has fetch but limited by CORS
- May need to relay through UI
- Test with simple echo endpoint first

### Gotchas
- No direct fetch in plugin main thread
- UI iframe subject to CORS
- Large payloads may need chunking
- Must handle network errors gracefully

### Algorithm/Approach
1. Create test endpoint (use httpbin.org or local server)
2. Try direct fetch from UI iframe
3. Implement message passing: main → UI → fetch → UI → main
4. Test with component extraction payload

### Communication Pattern
```
┌─────────────────────┐
│  Plugin Main Thread │ ← No fetch available
│  (sandbox)          │
└─────────┬───────────┘
          │ postMessage
          ▼
┌─────────────────────┐
│  UI iframe          │ ← Has fetch, CORS restricted
│  (ui.html)          │
└─────────┬───────────┘
          │ fetch
          ▼
┌─────────────────────┐
│  External API       │ ← Must allow CORS from null origin
│  (Admin Tool)       │
└─────────────────────┘
```

### Message Protocol
```typescript
// Main → UI
interface PluginMessage {
  type: 'SEND_TO_API';
  payload: {
    endpoint: string;
    method: 'GET' | 'POST';
    data?: unknown;
  };
  requestId: string;
}

// UI → Main
interface UIMessage {
  type: 'API_RESPONSE' | 'API_ERROR';
  requestId: string;
  data?: unknown;
  error?: string;
}
```

### CORS Requirements for Production
The Admin Tool API must return:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Files Created
- `figma-plugin/src/api/client.ts` — API client wrapper
- `figma-plugin/src/ui-fetch.ts` — UI-side fetch handler
- `figma-plugin/docs/api-communication.md` — Documentation

---

## Tests

### Unit Tests
- [ ] Can send message from main to UI
- [ ] Can receive message from UI to main
- [ ] UI can successfully fetch external endpoint

### Integration Tests
- [ ] Full round-trip: extract → send → receive response

### Verification
- [ ] Document CORS requirements for production
- [ ] Document payload size limits if any
- [ ] Test error handling for network failures

---

## Time Estimate
2 hours

---

## Notes
This validates the end-to-end communication path from Figma to the Admin Tool. CORS configuration is critical - document exact headers needed.
