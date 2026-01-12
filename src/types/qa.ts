/**
 * @chunk 7.17 - QA Page Shell
 * Type definitions for the Visual QA feature
 */

export interface CapturedAsset {
  id: string;
  image: {
    url: string;
    width: number;
    height: number;
  };
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
