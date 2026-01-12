/**
 * @chunk 7.06 - Input Router
 *
 * Normalizes all input types (image, URL, Figma) to a common CapturedAsset shape.
 * Routes to appropriate handler based on input type.
 */

import { QAInput, CapturedAsset, InputType, FigmaNode } from '../../types/qa';
import { captureWithDom, DOMElement } from '../../services/screenshotService';
import { FigmaService } from '../../services/figmaService';
import { parseFigmaUrl } from './figmaParser';

/**
 * Generate a unique ID for captured assets
 */
function generateId(): string {
  return `qa-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Route input to appropriate handler and return normalized CapturedAsset
 */
export async function captureInput(input: QAInput): Promise<CapturedAsset> {
  const id = generateId();

  switch (input.type) {
    case 'image':
      return captureFromImage(id, input);
    case 'url':
      return captureFromUrl(id, input);
    case 'figma':
      return captureFromFigma(id, input);
    default:
      throw new Error(`Unknown input type: ${(input as QAInput).type}`);
  }
}

/**
 * Handle image file upload input
 */
async function captureFromImage(id: string, input: QAInput): Promise<CapturedAsset> {
  if (!input.file || !input.preview) {
    throw new Error('Missing file or preview for image input');
  }

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

/**
 * Handle URL capture input - takes screenshot and extracts DOM elements
 */
async function captureFromUrl(id: string, input: QAInput): Promise<CapturedAsset> {
  if (!input.url) {
    throw new Error('Missing URL for URL input');
  }

  const result = await captureWithDom(input.url);

  // Convert base64 screenshot to blob
  const blob = await fetch(`data:image/png;base64,${result.screenshot}`).then((r) =>
    r.blob()
  );

  return {
    id,
    inputType: 'url',
    image: {
      blob,
      url: URL.createObjectURL(blob),
      width: result.viewport.width,
      height: result.viewport.height,
    },
    domElements: result.elements as DOMElement[],
    capturedAt: new Date(),
  };
}

/**
 * Handle Figma URL input - fetches node data and rendered image
 */
async function captureFromFigma(id: string, input: QAInput): Promise<CapturedAsset> {
  if (!input.figmaUrl || !input.figmaToken) {
    throw new Error('Missing Figma URL or token for Figma input');
  }

  const parsed = parseFigmaUrl(input.figmaUrl);
  if (!parsed) {
    throw new Error('Invalid Figma URL');
  }

  const service = new FigmaService(input.figmaToken);
  const { node, imageUrl } = await service.getNodeWithImage(
    parsed.fileKey,
    parsed.nodeId || '0:1'
  );

  // Fetch the rendered image
  const imgRes = await fetch(imageUrl);
  const blob = await imgRes.blob();

  // Create an image to get dimensions
  const imgUrl = URL.createObjectURL(blob);
  const { width, height } = await getImageDimensions(imgUrl);

  return {
    id,
    inputType: 'figma',
    image: {
      blob,
      url: imgUrl,
      width,
      height,
    },
    figmaNodes: [node as FigmaNode],
    capturedAt: new Date(),
  };
}

/**
 * Helper to get image dimensions from a blob URL
 */
function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}
