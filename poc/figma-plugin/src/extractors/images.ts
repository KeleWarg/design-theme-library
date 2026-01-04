/**
 * @chunk 0.03, 4.03 - Figma Plugin PoC - Image Export + ImageExporter Module
 * 
 * ImageExporter module for extracting images from Figma nodes.
 * Handles PNG, SVG, and JPG exports with configurable scale factors.
 * Converts Uint8Array output to base64 for transmission.
 * 
 * Chunk 4.03: Production-ready exportComponentImages function for component extraction.
 */

// ============================================================================
// Imports
// ============================================================================

import { ExportedImage } from '../types/images';

// ============================================================================
// Types
// ============================================================================

export type ExportFormat = 'PNG' | 'SVG' | 'JPG';

export interface ExportOptions {
  format: ExportFormat;
  scale?: number; // 1, 2, or 3 (default: 2)
}

export interface ExportResult {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  format: ExportFormat;
  scale: number;
  base64: string;
  mimeType: string;
  sizeBytes: number;
  exportTimeMs: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface ExportError {
  nodeId: string;
  nodeName: string;
  error: string;
}

export interface BatchExportResult {
  success: ExportResult[];
  errors: ExportError[];
  totalTimeMs: number;
}

export interface ExportBenchmark {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  dimensions: { width: number; height: number };
  format: ExportFormat;
  scale: number;
  sizeBytes: number;
  exportTimeMs: number;
}

// ============================================================================
// Configuration
// ============================================================================

/** Recommended export configuration by node type */
export const EXPORT_CONFIG: Record<string, { format: ExportFormat; scale: number }> = {
  // Vector graphics - SVG preferred
  VECTOR: { format: 'SVG', scale: 1 },
  STAR: { format: 'SVG', scale: 1 },
  LINE: { format: 'SVG', scale: 1 },
  ELLIPSE: { format: 'SVG', scale: 1 },
  POLYGON: { format: 'SVG', scale: 1 },
  BOOLEAN_OPERATION: { format: 'SVG', scale: 1 },
  
  // Raster/complex - PNG preferred
  RECTANGLE: { format: 'PNG', scale: 2 },
  FRAME: { format: 'PNG', scale: 2 },
  GROUP: { format: 'PNG', scale: 2 },
  COMPONENT: { format: 'PNG', scale: 2 },
  COMPONENT_SET: { format: 'PNG', scale: 2 },
  INSTANCE: { format: 'PNG', scale: 2 },
  TEXT: { format: 'PNG', scale: 2 },
  SLICE: { format: 'PNG', scale: 2 },
};

/** Default export settings */
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'PNG',
  scale: 2,
};

/** Maximum recommended image dimension (to prevent timeout) */
export const MAX_DIMENSION = 4096;

/** Export timeout in milliseconds */
export const EXPORT_TIMEOUT = 30000;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert Uint8Array to base64 string for transmission
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.length;
  // Process in chunks to avoid call stack issues with large arrays
  const chunkSize = 8192;
  
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
  }
  
  return btoa(binary);
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'PNG': return 'image/png';
    case 'SVG': return 'image/svg+xml';
    case 'JPG': return 'image/jpeg';
    default: return 'application/octet-stream';
  }
}

/**
 * Get recommended export config for a node type
 */
export function getRecommendedConfig(nodeType: string): ExportOptions {
  return EXPORT_CONFIG[nodeType] || DEFAULT_EXPORT_OPTIONS;
}

/**
 * Check if a node can be exported
 */
export function canExport(node: SceneNode): boolean {
  // Most scene nodes support export
  const exportableTypes = [
    'FRAME', 'GROUP', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE',
    'RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'LINE', 'VECTOR',
    'TEXT', 'BOOLEAN_OPERATION', 'SLICE', 'SECTION'
  ];
  
  return exportableTypes.includes(node.type);
}

/**
 * Check if dimensions are within safe export limits
 */
export function isWithinLimits(node: SceneNode, scale: number): boolean {
  if ('width' in node && 'height' in node) {
    const scaledWidth = node.width * scale;
    const scaledHeight = node.height * scale;
    return scaledWidth <= MAX_DIMENSION && scaledHeight <= MAX_DIMENSION;
  }
  return true;
}

/**
 * Get node dimensions
 */
export function getNodeDimensions(node: SceneNode): { width: number; height: number } {
  if ('width' in node && 'height' in node) {
    return {
      width: Math.round(node.width),
      height: Math.round(node.height),
    };
  }
  return { width: 0, height: 0 };
}

// ============================================================================
// Core Export Functions
// ============================================================================

/**
 * Export a single node to the specified format
 */
export async function exportNode(
  node: SceneNode,
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS
): Promise<ExportResult> {
  const startTime = performance.now();
  const { format, scale = 2 } = options;
  
  // Validate node can be exported
  if (!canExport(node)) {
    throw new Error(`Node type ${node.type} cannot be exported`);
  }
  
  // Check dimension limits
  if (!isWithinLimits(node, scale)) {
    throw new Error(`Node dimensions exceed safe limits at ${scale}x scale`);
  }
  
  // Build export settings
  const exportSettings: ExportSettings = format === 'SVG'
    ? { format: 'SVG' }
    : {
        format: format,
        constraint: { type: 'SCALE', value: scale },
      };
  
  // Perform export
  const bytes = await node.exportAsync(exportSettings);
  const base64 = uint8ArrayToBase64(bytes);
  
  const endTime = performance.now();
  const dimensions = getNodeDimensions(node);
  
  return {
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    format,
    scale: format === 'SVG' ? 1 : scale,
    base64,
    mimeType: getMimeType(format),
    sizeBytes: bytes.length,
    exportTimeMs: Math.round(endTime - startTime),
    dimensions,
  };
}

/**
 * Export a node using recommended settings for its type
 */
export async function exportNodeAuto(node: SceneNode): Promise<ExportResult> {
  const config = getRecommendedConfig(node.type);
  return exportNode(node, config);
}

/**
 * Export multiple nodes in batch
 */
export async function exportNodes(
  nodes: SceneNode[],
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS
): Promise<BatchExportResult> {
  const startTime = performance.now();
  const success: ExportResult[] = [];
  const errors: ExportError[] = [];
  
  for (const node of nodes) {
    try {
      const result = await exportNode(node, options);
      success.push(result);
    } catch (err) {
      errors.push({
        nodeId: node.id,
        nodeName: node.name,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }
  
  const endTime = performance.now();
  
  return {
    success,
    errors,
    totalTimeMs: Math.round(endTime - startTime),
  };
}

/**
 * Export nodes using auto-recommended settings per node type
 */
export async function exportNodesAuto(nodes: SceneNode[]): Promise<BatchExportResult> {
  const startTime = performance.now();
  const success: ExportResult[] = [];
  const errors: ExportError[] = [];
  
  for (const node of nodes) {
    try {
      const result = await exportNodeAuto(node);
      success.push(result);
    } catch (err) {
      errors.push({
        nodeId: node.id,
        nodeName: node.name,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }
  
  const endTime = performance.now();
  
  return {
    success,
    errors,
    totalTimeMs: Math.round(endTime - startTime),
  };
}

// ============================================================================
// Benchmarking
// ============================================================================

/**
 * Run export benchmarks on a node with various settings
 */
export async function benchmarkNode(node: SceneNode): Promise<ExportBenchmark[]> {
  const benchmarks: ExportBenchmark[] = [];
  const dimensions = getNodeDimensions(node);
  
  // Test configurations
  const configs: ExportOptions[] = [
    { format: 'PNG', scale: 1 },
    { format: 'PNG', scale: 2 },
    { format: 'PNG', scale: 3 },
    { format: 'SVG' },
    { format: 'JPG', scale: 1 },
    { format: 'JPG', scale: 2 },
  ];
  
  for (const config of configs) {
    // Skip if dimensions would exceed limits
    const scale = config.scale || 1;
    if (!isWithinLimits(node, scale)) {
      continue;
    }
    
    try {
      const result = await exportNode(node, config);
      benchmarks.push({
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        dimensions,
        format: config.format,
        scale: result.scale,
        sizeBytes: result.sizeBytes,
        exportTimeMs: result.exportTimeMs,
      });
    } catch (err) {
      // Skip failed exports in benchmark
      console.warn(`Benchmark failed for ${config.format}@${scale}x:`, err);
    }
  }
  
  return benchmarks;
}

/**
 * Get formatted benchmark report
 */
export function formatBenchmarkReport(benchmarks: ExportBenchmark[]): string {
  const lines: string[] = [
    '=== Export Benchmark Report ===',
    '',
  ];
  
  // Group by node
  const byNode = new Map<string, ExportBenchmark[]>();
  for (const b of benchmarks) {
    const key = b.nodeId;
    if (!byNode.has(key)) {
      byNode.set(key, []);
    }
    byNode.get(key)!.push(b);
  }
  
  for (const [nodeId, nodeBenchmarks] of byNode) {
    const first = nodeBenchmarks[0];
    lines.push(`Node: ${first.nodeName} (${first.nodeType})`);
    lines.push(`Dimensions: ${first.dimensions.width}x${first.dimensions.height}px`);
    lines.push('');
    lines.push('| Format | Scale | Size (bytes) | Time (ms) |');
    lines.push('|--------|-------|--------------|-----------|');
    
    for (const b of nodeBenchmarks) {
      const sizeKB = (b.sizeBytes / 1024).toFixed(1);
      lines.push(`| ${b.format.padEnd(6)} | ${String(b.scale).padEnd(5)} | ${String(b.sizeBytes).padStart(12)} | ${String(b.exportTimeMs).padStart(9)} |`);
    }
    
    lines.push('');
  }
  
  return lines.join('\n');
}

// ============================================================================
// Export Module
// ============================================================================

export const ImageExporter = {
  // Core exports
  exportNode,
  exportNodeAuto,
  exportNodes,
  exportNodesAuto,
  
  // Utilities
  uint8ArrayToBase64,
  getMimeType,
  getRecommendedConfig,
  canExport,
  isWithinLimits,
  getNodeDimensions,
  
  // Benchmarking
  benchmarkNode,
  formatBenchmarkReport,
  
  // Config
  EXPORT_CONFIG,
  DEFAULT_EXPORT_OPTIONS,
  MAX_DIMENSION,
};

// ============================================================================
// Chunk 4.03: Component Image Export
// ============================================================================

/**
 * @chunk 4.03 - Export images from component nodes
 * 
 * Exports all image and vector nodes within a component, plus a preview of the component itself.
 * Returns base64 encoded images with metadata for storage and deduplication.
 */
export interface ComponentImageExportOptions {
  scale?: number; // 1, 2, or 3 (default: 2)
  format?: 'PNG' | 'SVG'; // Auto-determined for vectors
  includePreview?: boolean; // Export component preview (default: true)
}

/**
 * Export all images from a component node
 */
export async function exportComponentImages(
  node: ComponentNode | ComponentSetNode,
  options: ComponentImageExportOptions = {}
): Promise<ExportedImage[]> {
  const { scale = 2, includePreview = true } = options;
  const images: ExportedImage[] = [];
  
  // Find all image/vector nodes within the component
  const imageNodes = findImageNodes(node);

  // Export individual image/vector nodes
  for (const imageNode of imageNodes) {
    try {
      const image = await exportNodeAsImage(imageNode, { scale });
      if (image) {
        images.push(image);
      }
    } catch (error) {
      console.warn(`Failed to export image from ${imageNode.name}:`, error);
    }
  }

  // Export the component itself as a preview (2x scale)
  if (includePreview) {
    try {
      const preview = await exportNodeAsImage(node, { scale: 2, format: 'PNG' });
      if (preview) {
        preview.nodeName = `${node.name}_preview`;
        images.unshift(preview); // Put preview first
      }
    } catch (error) {
      console.warn('Failed to export component preview:', error);
    }
  }

  return images;
}

/**
 * Find all image and vector nodes within a component tree
 */
function findImageNodes(node: SceneNode): SceneNode[] {
  const nodes: SceneNode[] = [];

  function traverse(n: SceneNode) {
    // Check if this node has image fills
    if ('fills' in n) {
      const fills = n.fills as readonly Paint[];
      if (Array.isArray(fills) && fills.some(f => f.type === 'IMAGE')) {
        nodes.push(n);
      }
    }

    // Check for vector nodes (icons)
    if (n.type === 'VECTOR' || n.type === 'STAR' || n.type === 'POLYGON') {
      nodes.push(n);
    }

    // Traverse children
    if ('children' in n) {
      for (const child of n.children) {
        traverse(child);
      }
    }
  }

  traverse(node);
  return nodes;
}

/**
 * Export a single node as an ExportedImage
 */
async function exportNodeAsImage(
  node: SceneNode,
  options: { scale?: number; format?: 'PNG' | 'SVG' } = {}
): Promise<ExportedImage | null> {
  const { scale = 2, format } = options;

  // Determine best format - use SVG for vectors
  let exportFormat: 'PNG' | 'SVG' = format || 'PNG';
  if (!format && (node.type === 'VECTOR' || node.type === 'STAR' || node.type === 'POLYGON')) {
    exportFormat = 'SVG';
  }

  const settings: ExportSettings = exportFormat === 'SVG'
    ? { format: 'SVG' }
    : { format: 'PNG', constraint: { type: 'SCALE', value: scale } };

  try {
    const bytes = await node.exportAsync(settings);
    const base64 = uint8ArrayToBase64(bytes);
    const hash = await generateHash(bytes);

    return {
      nodeId: node.id,
      nodeName: node.name,
      data: base64,
      format: exportFormat,
      width: Math.round(('width' in node ? node.width : 0) * (exportFormat === 'PNG' ? scale : 1)),
      height: Math.round(('height' in node ? node.height : 0) * (exportFormat === 'PNG' ? scale : 1)),
      hash,
    };
  } catch (error) {
    console.warn(`Failed to export node ${node.name}:`, error);
    return null;
  }
}

/**
 * Generate a simple hash for image deduplication
 */
async function generateHash(bytes: Uint8Array): Promise<string> {
  // Simple hash for deduplication
  let hash = 0;
  for (let i = 0; i < bytes.length; i++) {
    hash = ((hash << 5) - hash) + bytes[i];
    hash = hash & hash;
  }
  return hash.toString(16);
}

export default ImageExporter;


