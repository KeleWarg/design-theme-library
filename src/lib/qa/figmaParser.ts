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
