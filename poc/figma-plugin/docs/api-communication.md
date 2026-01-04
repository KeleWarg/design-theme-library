# Figma Plugin API Communication

Documentation of the communication pattern between the Figma plugin and external APIs.

## Architecture Overview

```
┌─────────────────────────────────────┐
│         Plugin Main Thread          │
│  ┌─────────────────────────────┐   │
│  │     PluginAPIClient         │   │
│  │  - Manages pending requests │   │
│  │  - Handles timeouts         │   │
│  │  - No direct fetch access   │   │
│  └──────────┬──────────────────┘   │
│             │ postMessage           │
└─────────────┼───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│          UI Iframe (ui.html)        │
│  ┌─────────────────────────────┐   │
│  │     UIFetchHandler          │   │
│  │  - Listens for requests     │   │
│  │  - Executes fetch()         │   │
│  │  - Returns responses        │   │
│  └──────────┬──────────────────┘   │
│             │ fetch()               │
└─────────────┼───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         External API                │
│  (Admin Tool / Test Endpoint)       │
│                                     │
│  Must return CORS headers:          │
│  Access-Control-Allow-Origin: *     │
└─────────────────────────────────────┘
```

## Message Protocol

### Request Message (Main → UI)

```typescript
interface APIRequestMessage {
  type: 'API_REQUEST';
  requestId: string;        // Unique ID for tracking
  payload: {
    endpoint: string;       // Full URL
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: unknown;         // Request body (JSON)
    headers?: Record<string, string>;
    timeout?: number;       // Optional timeout in ms
  };
}
```

### Response Message (UI → Main)

```typescript
interface APIResponseMessage {
  type: 'API_RESPONSE';
  requestId: string;
  response: {
    success: boolean;       // HTTP 2xx = true
    status: number;         // HTTP status code
    data?: unknown;         // Parsed response body
    error?: string;         // Error message if failed
    timing: {
      requestedAt: number;  // Timestamp
      completedAt: number;
      durationMs: number;
    };
  };
}
```

### Error Message (UI → Main)

```typescript
interface APIErrorMessage {
  type: 'API_ERROR';
  requestId: string;
  error: string;
}
```

## Usage

### In Plugin Main Thread

```typescript
import { apiClient } from './api/client';

// Simple GET request
const response = await apiClient.get('https://api.example.com/data');

// POST with data
const result = await apiClient.post('https://api.example.com/import', {
  componentId: '123',
  data: extractedComponent,
});

// With custom headers
const authResponse = await apiClient.post(
  'https://api.example.com/secure',
  { data: 'value' },
  { 'Authorization': 'Bearer token123' }
);

// Handle response
if (response.success) {
  console.log('Data:', response.data);
} else {
  console.error('Error:', response.error);
}
```

### In UI Code

```typescript
import { uiFetchHandler } from './api/ui-fetch';

// Start listening for requests (call once on init)
uiFetchHandler.startListening();

// The handler automatically processes API_REQUEST messages
// and sends back API_RESPONSE or API_ERROR messages
```

## CORS Requirements

The Admin Tool API **must** return these headers for the plugin to communicate:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Why `*` for Origin?

Figma plugin UI iframes send requests with `Origin: null` (sandboxed iframe).
Most CORS configurations don't handle this, so `*` is the safest option.

### Preflight Requests

For POST/PUT with JSON body, browsers send OPTIONS preflight requests.
The server must handle OPTIONS and return appropriate CORS headers.

Example Express.js middleware:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

## Test Endpoints

For validation, use these public test APIs:

| Endpoint | Purpose |
|----------|---------|
| `https://httpbin.org/post` | Echo POST data |
| `https://httpbin.org/get` | Echo GET request |
| `https://httpbin.org/delay/2` | Test timeout handling |
| `https://httpbin.org/status/500` | Test error handling |
| `https://jsonplaceholder.typicode.com/posts` | Fake REST API |

## Error Handling

### Network Errors

```typescript
{
  success: false,
  status: 0,
  error: "Network error: Failed to fetch. This may be a CORS issue."
}
```

### Timeout Errors

```typescript
{
  success: false,
  status: 0,
  error: "Request timed out after 30000ms"
}
```

### HTTP Errors

```typescript
{
  success: false,
  status: 404,
  error: "HTTP 404: Not Found"
}
```

## Payload Size Limits

### Tested Limits

| Payload Size | Result |
|--------------|--------|
| < 100 KB | ✅ Works reliably |
| 100 KB - 1 MB | ✅ Works, may be slow |
| > 1 MB | ⚠️ May timeout, consider chunking |

### Recommendations

1. **Component data**: Usually < 50 KB, no issues
2. **Image data (base64)**: Can be large, consider chunking or direct upload
3. **Batch operations**: Send in chunks of 10-20 items

## Chunking Large Payloads

For large payloads, implement chunking:

```typescript
async function sendLargeData(data: unknown[], chunkSize = 20) {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  
  const results = [];
  for (const chunk of chunks) {
    const response = await apiClient.post('/import', { 
      items: chunk,
      chunkIndex: results.length,
      totalChunks: chunks.length,
    });
    results.push(response);
  }
  
  return results;
}
```

## Security Considerations

1. **No sensitive data in plugin**: Don't store API keys in plugin code
2. **Use HTTPS**: All endpoints should use HTTPS
3. **Validate on server**: Never trust client-side validation
4. **Rate limiting**: Implement on server to prevent abuse

## Debugging

### Enable Logging

Both `PluginAPIClient` and `UIFetchHandler` log to console:

```
[UIFetchHandler] Received request: req_1704307200000_1
[UIFetchHandler] Fetching: POST https://api.example.com/import
[UIFetchHandler] Sent response for: req_1704307200000_1
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Network error" | CORS not configured | Add CORS headers to server |
| "Request timed out" | Slow server / large payload | Increase timeout, reduce payload |
| No response | UI handler not started | Call `uiFetchHandler.startListening()` |
| Request ID mismatch | Multiple instances | Use singleton pattern |

## Production Checklist

- [ ] Admin Tool API has CORS headers configured
- [ ] HTTPS endpoints only
- [ ] Timeout handling tested
- [ ] Error states handled in UI
- [ ] Large payload chunking implemented (if needed)
- [ ] Rate limiting on server
- [ ] Logging for debugging

## Next Steps

After validating API communication:
- **Chunk 4.04**: Production PluginAPIClient with retry logic
- **Chunk 4.11**: Admin Tool import endpoint implementation


