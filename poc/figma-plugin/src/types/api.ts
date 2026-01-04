/**
 * @chunk 4.04 - PluginAPIClient
 * 
 * Type definitions for component export API communication
 */

import { ExtractedComponent } from './component';
import { ExportedImage } from './images';

export interface ExportPayload {
  components: ExtractedComponent[];
  images: ExportedImage[];
  metadata: {
    fileKey: string;
    fileName: string;
    exportedAt: string;
    figmaFileId?: string;
    figmaFileName?: string;
  };
}

export interface ExportResult {
  success: boolean;
  importId: string;
  status?: 'pending' | 'complete';
}

export interface ExportOptions {
  apiUrl: string;
  authToken?: string;
  onProgress?: (progress: number) => void;
  maxRetries?: number;
  retryDelay?: number;
}





