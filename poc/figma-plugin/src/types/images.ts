/**
 * @chunk 4.03 - ImageExporter Module
 * 
 * Type definitions for exported images from Figma components.
 */

export interface ExportedImage {
  nodeId: string;
  nodeName: string;
  data: string; // base64
  format: 'PNG' | 'SVG';
  width: number;
  height: number;
  hash: string;
}




