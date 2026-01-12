/**
 * @chunk 7.17 - QA Page Shell
 * @chunk 7.06 - Input Router types
 * Type definitions for the Visual QA feature
 */

/**
 * @chunk 7.06 - Input type enum
 */
export type InputType = 'image' | 'url' | 'figma';

/**
 * @chunk 7.06 - QA Input specification for captureInput router
 */
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

/**
 * @chunk 7.09 - DOM Element from captured page
 */
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

/**
 * @chunk 7.06 - FigmaNode type for captured Figma nodes
 */
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  fills?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number } }>;
  children?: FigmaNode[];
}

/**
 * @chunk 7.06 - CapturedAsset normalized shape from all input types
 */
export interface CapturedAsset {
  id: string;
  inputType: InputType;
  image: {
    url: string;
    width: number;
    height: number;
    blob?: Blob;
  };
  domElements?: DOMElement[];
  figmaNodes?: FigmaNode[];
  capturedAt: Date;
  metadata?: {
    source?: string;
    name?: string;
  };
}

export interface MarkerPosition {
  x: number;
  y: number;
}

export interface IssueSuggestion {
  cssVariable: string;
  value: string;
  tokenName?: string;
}

export interface IssueSource {
  value: string;
  rgb?: { r: number; g: number; b: number };
}

export interface IssueBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Issue {
  id: string;
  number: number;
  type: 'color' | 'font' | 'typography' | 'spacing' | 'other';
  status: 'fail' | 'warn' | 'pass';
  message: string;
  marker: MarkerPosition;
  bounds: IssueBounds;
  source: IssueSource;
  suggestion?: IssueSuggestion;
}
