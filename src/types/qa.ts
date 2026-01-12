/**
 * @chunk 7.17 - QA Page Shell
 * Type definitions for the Visual QA feature
 */

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

export interface CapturedAsset {
  id: string;
  inputType?: 'url' | 'image' | 'figma';
  image: {
    url: string;
    width: number;
    height: number;
    blob?: Blob;
  };
  domElements?: DOMElement[];
  metadata?: {
    source?: string;
    capturedAt?: string;
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

export interface Issue {
  id: string;
  number: number;
  type: 'color' | 'typography' | 'spacing' | 'other';
  status: 'fail' | 'warn' | 'pass';
  message: string;
  marker: MarkerPosition;
  source: IssueSource;
  suggestion?: IssueSuggestion;
}
