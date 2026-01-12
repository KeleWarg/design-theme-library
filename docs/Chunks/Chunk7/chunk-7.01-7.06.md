# Phase 7 Input Layer — Chunks 7.01-7.06

## Overview
Input layer normalizes all input sources (image, URL, Figma) to a common `CapturedAsset` shape.

---

## Chunk 7.01 — ImageDropzone

### Purpose
Drag-and-drop image upload with preview.

### Requirements
- Use `react-dropzone` for drag-and-drop
- Accept: PNG, JPG, JPEG, WebP (max 10MB)
- Show dashed border drop zone with icon
- After upload: show preview image with dimensions
- Clear button to reset
- Call `onSelect({ file, preview, width, height })`

### Implementation

```jsx
// src/components/qa/input/ImageDropzone.jsx
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

export function ImageDropzone({ onSelect }) {
  const [preview, setPreview] = useState(null);
  const [dimensions, setDimensions] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      setPreview(url);
      onSelect({ file, preview: url, width: img.width, height: img.height });
    };
    img.src = url;
  }, [onSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleClear = () => {
    setPreview(null);
    setDimensions(null);
    onSelect(null);
  };

  if (preview) {
    return (
      <div className="relative">
        <img src={preview} alt="Preview" className="max-h-64 rounded-lg" />
        <div className="text-sm text-gray-500 mt-2">
          {dimensions?.width} × {dimensions?.height}
        </div>
        <button onClick={handleClear} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
      <p className="text-gray-600">Drop an image here, or click to select</p>
      <p className="text-sm text-gray-400 mt-2">PNG, JPG, WebP up to 10MB</p>
    </div>
  );
}
```

### Files
- `src/components/qa/input/ImageDropzone.jsx`

### Test
```bash
npm run build
```

---

## Chunk 7.02 — UrlInput

### Purpose
Text input for entering URLs to capture.

### Requirements
- Text input with URL validation
- Only accept http:// or https://
- Submit button (disabled while invalid)
- Loading spinner during capture
- Error message for invalid URLs
- Enter key submits

### Implementation

```jsx
// src/components/qa/input/UrlInput.jsx
import { useState } from 'react';
import { Globe, Loader2 } from 'lucide-react';

export function UrlInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const isValidUrl = (str) => {
    try {
      const u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (http:// or https://)');
      return;
    }
    setError('');
    onSubmit(url);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !url}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Capture'}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

### Files
- `src/components/qa/input/UrlInput.jsx`

---

## Chunk 7.03 — Figma Link Parser

### Purpose
Parse Figma URLs to extract file key and node ID.

### Requirements
- Handle multiple Figma URL formats:
  - `figma.com/file/ABC123/Name`
  - `figma.com/design/ABC123/Name?node-id=1-2`
  - `figma.com/design/ABC123/Name?node-id=1%3A2` (URL encoded)
- Return `{ fileKey, nodeId }` or `null`
- `isValidFigmaUrl()` helper

### Implementation

```typescript
// src/lib/qa/figmaParser.ts

export interface FigmaUrlParts {
  fileKey: string;
  nodeId?: string;
}

export function parseFigmaUrl(url: string): FigmaUrlParts | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('figma.com')) return null;

    // Match /file/KEY or /design/KEY
    const match = u.pathname.match(/\/(file|design)\/([a-zA-Z0-9]+)/);
    if (!match) return null;

    const fileKey = match[2];
    
    // Get node-id from query params
    let nodeId = u.searchParams.get('node-id');
    if (nodeId) {
      // Decode URL-encoded colon (1%3A2 → 1:2)
      nodeId = decodeURIComponent(nodeId);
      // Convert dash format to colon (1-2 → 1:2)
      nodeId = nodeId.replace(/-/g, ':');
    }

    return { fileKey, nodeId: nodeId || undefined };
  } catch {
    return null;
  }
}

export function isValidFigmaUrl(url: string): boolean {
  return parseFigmaUrl(url) !== null;
}
```

### Files
- `src/lib/qa/figmaParser.ts`

### Test
```typescript
// Quick verification
console.log(parseFigmaUrl('https://figma.com/design/ABC123/Name?node-id=1-2'));
// → { fileKey: 'ABC123', nodeId: '1:2' }
```

---

## Chunk 7.04 — Screenshot + DOM Capture Service

### Purpose
Supabase Edge Function that captures webpage screenshots AND extracts DOM element bounds.

### Requirements
- Accept POST `{ url, viewport? }`
- Use Puppeteer to navigate and screenshot
- Inject script to extract visible elements with:
  - `selector` (CSS selector path)
  - `bounds` { x, y, width, height }
  - `styles` { color, backgroundColor, fontFamily, fontSize }
  - `textContent` (first 100 chars)
- Return `{ screenshot: base64, viewport, elements[] }`

### Implementation

```typescript
// supabase/functions/capture-with-dom/index.ts
import puppeteer from 'puppeteer-core';

const EXTRACTION_SCRIPT = `
(() => {
  const elements = [];
  const seen = new Set();
  
  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;
    if (rect.top > window.innerHeight || rect.left > window.innerWidth) return;
    
    const styles = window.getComputedStyle(el);
    const color = styles.color;
    const bg = styles.backgroundColor;
    
    // Skip if no visible color
    if (bg === 'rgba(0, 0, 0, 0)' && color === 'rgb(0, 0, 0)') return;
    
    const key = \`\${rect.x},\${rect.y},\${rect.width},\${rect.height}\`;
    if (seen.has(key)) return;
    seen.add(key);
    
    elements.push({
      selector: getSelector(el),
      bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      styles: {
        color,
        backgroundColor: bg,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
      },
      textContent: el.textContent?.slice(0, 100) || '',
    });
  });
  
  function getSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.className) return '.' + el.className.split(' ')[0];
    return el.tagName.toLowerCase();
  }
  
  return elements;
})()
`;

Deno.serve(async (req) => {
  const { url, viewport = { width: 1440, height: 900 } } = await req.json();
  
  const browser = await puppeteer.connect({
    browserWSEndpoint: Deno.env.get('BROWSER_WS_ENDPOINT'),
  });
  
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  const screenshot = await page.screenshot({ encoding: 'base64' });
  const elements = await page.evaluate(EXTRACTION_SCRIPT);
  
  await browser.close();
  
  return new Response(JSON.stringify({ screenshot, viewport, elements }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

```typescript
// src/services/screenshotService.ts
import { supabase } from '../lib/supabase';

export async function captureWithDom(url: string, viewport?: { width: number; height: number }) {
  const { data, error } = await supabase.functions.invoke('capture-with-dom', {
    body: { url, viewport },
  });
  
  if (error) throw error;
  return data as {
    screenshot: string;
    viewport: { width: number; height: number };
    elements: DOMElement[];
  };
}

export interface DOMElement {
  selector: string;
  bounds: { x: number; y: number; width: number; height: number };
  styles: {
    color: string;
    backgroundColor: string;
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
  };
  textContent: string;
}
```

### Files
- `supabase/functions/capture-with-dom/index.ts`
- `src/services/screenshotService.ts`

---

## Chunk 7.05 — Figma API Service

### Purpose
Fetch Figma node data and rendered images.

### Requirements
- `FigmaService` class with token in constructor
- `getNodeWithImage(fileKey, nodeId)` returns:
  - `imageUrl`: PNG render URL
  - `node`: full node data with absoluteBoundingBox
  - `frameOrigin`: { x, y } for coordinate calculation
- `extractColorsFromNode(node, frameOrigin)` extracts fill colors with bounds

### Implementation

```typescript
// src/services/figmaService.ts

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  fills?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number } }>;
  children?: FigmaNode[];
}

export class FigmaService {
  private token: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(token: string) {
    this.token = token;
  }

  private async fetch(path: string) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'X-Figma-Token': this.token },
    });
    if (!res.ok) throw new Error(`Figma API error: ${res.status}`);
    return res.json();
  }

  async getNodeWithImage(fileKey: string, nodeId: string) {
    // Get node data
    const nodesData = await this.fetch(`/files/${fileKey}/nodes?ids=${nodeId}`);
    const node = nodesData.nodes[nodeId]?.document;
    if (!node) throw new Error('Node not found');

    // Get rendered image
    const imagesData = await this.fetch(`/images/${fileKey}?ids=${nodeId}&format=png&scale=2`);
    const imageUrl = imagesData.images[nodeId];

    const frameOrigin = node.absoluteBoundingBox 
      ? { x: node.absoluteBoundingBox.x, y: node.absoluteBoundingBox.y }
      : { x: 0, y: 0 };

    return { node, imageUrl, frameOrigin };
  }

  extractColorsFromNode(node: FigmaNode, frameOrigin: { x: number; y: number }) {
    const colors: Array<{
      hex: string;
      bounds: { x: number; y: number; width: number; height: number };
    }> = [];

    const traverse = (n: FigmaNode) => {
      if (n.fills && n.absoluteBoundingBox) {
        for (const fill of n.fills) {
          if (fill.type === 'SOLID' && fill.color) {
            const { r, g, b } = fill.color;
            const hex = `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
            
            colors.push({
              hex,
              bounds: {
                x: n.absoluteBoundingBox.x - frameOrigin.x,
                y: n.absoluteBoundingBox.y - frameOrigin.y,
                width: n.absoluteBoundingBox.width,
                height: n.absoluteBoundingBox.height,
              },
            });
          }
        }
      }
      n.children?.forEach(traverse);
    };

    traverse(node);
    return colors;
  }
}
```

### Files
- `src/services/figmaService.ts`

---

## Chunk 7.06 — Input Router

### Purpose
Normalize all input types to a common `CapturedAsset` shape.

### Requirements
- `captureInput(input: QAInput)` routes to appropriate handler
- Returns `CapturedAsset` with consistent shape
- Handles errors gracefully

### Implementation

```typescript
// src/types/qa.ts
export type InputType = 'image' | 'url' | 'figma';

export interface QAInput {
  type: InputType;
  // For image
  file?: File;
  preview?: string;
  width?: number;
  height?: number;
  // For URL
  url?: string;
  // For Figma
  figmaUrl?: string;
  figmaToken?: string;
}

export interface CapturedAsset {
  id: string;
  inputType: InputType;
  image: {
    blob?: Blob;
    url: string;
    width: number;
    height: number;
  };
  domElements?: DOMElement[];
  figmaNodes?: FigmaNode[];
  capturedAt: Date;
}

export interface DOMElement {
  selector: string;
  bounds: { x: number; y: number; width: number; height: number };
  styles: Record<string, string>;
  textContent: string;
}
```

```typescript
// src/lib/qa/inputRouter.ts
import { QAInput, CapturedAsset, InputType } from '../../types/qa';
import { captureWithDom } from '../../services/screenshotService';
import { FigmaService } from '../../services/figmaService';
import { parseFigmaUrl } from './figmaParser';

export async function captureInput(input: QAInput): Promise<CapturedAsset> {
  const id = `qa-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  switch (input.type) {
    case 'image':
      return captureFromImage(id, input);
    case 'url':
      return captureFromUrl(id, input);
    case 'figma':
      return captureFromFigma(id, input);
    default:
      throw new Error(`Unknown input type: ${input.type}`);
  }
}

async function captureFromImage(id: string, input: QAInput): Promise<CapturedAsset> {
  if (!input.file || !input.preview) throw new Error('Missing file or preview');
  
  return {
    id,
    inputType: 'image',
    image: {
      blob: input.file,
      url: input.preview,
      width: input.width || 0,
      height: input.height || 0,
    },
    capturedAt: new Date(),
  };
}

async function captureFromUrl(id: string, input: QAInput): Promise<CapturedAsset> {
  if (!input.url) throw new Error('Missing URL');
  
  const result = await captureWithDom(input.url);
  const blob = await fetch(`data:image/png;base64,${result.screenshot}`).then(r => r.blob());
  
  return {
    id,
    inputType: 'url',
    image: {
      blob,
      url: URL.createObjectURL(blob),
      width: result.viewport.width,
      height: result.viewport.height,
    },
    domElements: result.elements,
    capturedAt: new Date(),
  };
}

async function captureFromFigma(id: string, input: QAInput): Promise<CapturedAsset> {
  if (!input.figmaUrl || !input.figmaToken) throw new Error('Missing Figma URL or token');
  
  const parsed = parseFigmaUrl(input.figmaUrl);
  if (!parsed) throw new Error('Invalid Figma URL');
  
  const service = new FigmaService(input.figmaToken);
  const { node, imageUrl, frameOrigin } = await service.getNodeWithImage(
    parsed.fileKey,
    parsed.nodeId || '0:1'
  );
  
  const imgRes = await fetch(imageUrl);
  const blob = await imgRes.blob();
  const img = new Image();
  img.src = URL.createObjectURL(blob);
  await new Promise(resolve => img.onload = resolve);
  
  return {
    id,
    inputType: 'figma',
    image: {
      blob,
      url: img.src,
      width: img.width,
      height: img.height,
    },
    figmaNodes: [node],
    capturedAt: new Date(),
  };
}
```

### Files
- `src/types/qa.ts`
- `src/lib/qa/inputRouter.ts`

---

## Gate 7A Verification

```bash
npm run build
```

All input types should:
1. Return a `CapturedAsset` with `id`, `inputType`, `image`, `capturedAt`
2. Image input: have `blob` and `url`
3. URL input: have `domElements[]`
4. Figma input: have `figmaNodes[]`
