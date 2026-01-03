# Chunk 4.04 — PluginAPIClient

## Purpose
Send extracted data to Admin Tool API.

---

## Inputs
- Extracted component data
- Exported images
- API URL

## Outputs
- API communication module

---

## Dependencies
- Chunk 0.04 must be complete

---

## Implementation Notes

### Type Definitions
```typescript
// figma-plugin/src/types/api.ts
import { ExtractedComponent } from './component';
import { ExportedImage } from './images';

export interface ExportPayload {
  components: ExtractedComponent[];
  images: ExportedImage[];
  metadata: {
    fileKey: string;
    fileName: string;
    exportedAt: string;
  };
}

export interface ExportResult {
  success: boolean;
  importId: string;
}
```

### API Client
```typescript
// figma-plugin/src/api/client.ts
import { ExportPayload, ExportResult } from '../types/api';

export class PluginAPIClient {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
  }

  async exportComponents(
    payload: ExportPayload,
    onProgress?: (progress: number) => void
  ): Promise<ExportResult> {
    const chunks = this.chunkPayload(payload);
    let importId: string | null = null;
    
    for (let i = 0; i < chunks.length; i++) {
      const response = await this.sendChunk(chunks[i], importId);
      importId = response.importId;
      
      if (onProgress) {
        onProgress(((i + 1) / chunks.length) * 100);
      }
    }

    return {
      success: true,
      importId: importId!,
    };
  }

  private chunkPayload(payload: ExportPayload): ExportPayload[] {
    const payloadSize = JSON.stringify(payload).length;
    
    // If small enough, return as-is
    if (payloadSize < 1_000_000) { // 1MB
      return [payload];
    }

    // Otherwise, split by component
    const chunks: ExportPayload[] = [];
    const COMPONENTS_PER_CHUNK = 5;

    for (let i = 0; i < payload.components.length; i += COMPONENTS_PER_CHUNK) {
      const componentSlice = payload.components.slice(i, i + COMPONENTS_PER_CHUNK);
      const componentIds = new Set(componentSlice.map(c => c.id));
      
      // Include only images for these components
      const imageSlice = payload.images.filter(img => 
        componentIds.has(img.nodeId.split('/')[0])
      );

      chunks.push({
        components: componentSlice,
        images: imageSlice,
        metadata: payload.metadata,
      });
    }

    return chunks;
  }

  private async sendChunk(
    chunk: ExportPayload,
    existingImportId: string | null
  ): Promise<{ importId: string }> {
    const endpoint = existingImportId
      ? `${this.apiUrl}/api/figma-import/${existingImportId}/chunk`
      : `${this.apiUrl}/api/figma-import`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chunk),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    return response.json();
  }
}
```

### UI-side Fetch Handler
```typescript
// figma-plugin/src/ui/fetchHandler.ts
import { PluginAPIClient } from '../api/client';

export function setupFetchHandler() {
  window.addEventListener('message', async (event) => {
    const msg = event.data.pluginMessage;
    if (!msg || msg.type !== 'api-request') return;

    try {
      const client = new PluginAPIClient(msg.apiUrl);
      const result = await client.exportComponents(msg.payload, (progress) => {
        parent.postMessage({
          pluginMessage: { type: 'api-progress', progress }
        }, '*');
      });
      
      parent.postMessage({
        pluginMessage: { type: 'api-response', success: true, result }
      }, '*');
    } catch (error) {
      parent.postMessage({
        pluginMessage: { 
          type: 'api-response', 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }, '*');
    }
  });
}
```

---

## Files Created
- `figma-plugin/src/types/api.ts` — API type definitions
- `figma-plugin/src/api/client.ts` — API client
- `figma-plugin/src/ui/fetchHandler.ts` — UI-side fetch handling

---

## Tests

### Unit Tests
- [ ] Payload chunking works for large exports
- [ ] API request format correct
- [ ] Progress callback invoked
- [ ] Error handling works
- [ ] Chunked uploads use same importId

---

## Time Estimate
2 hours
