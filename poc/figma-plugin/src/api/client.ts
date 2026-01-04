/**
 * @chunk 0.04 - Figma Plugin PoC - API Communication
 * 
 * API client wrapper for communicating with external services from the Figma plugin.
 * Since the plugin main thread has no fetch access, this uses message passing to the UI.
 */

import type { ExportPayload, ExportResult, ExportOptions } from '../types/api';

// ============================================================================
// Types
// ============================================================================

export interface APIRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  status: number;
  data?: T;
  error?: string;
  timing: {
    requestedAt: number;
    completedAt: number;
    durationMs: number;
  };
}

export interface PendingRequest {
  requestId: string;
  resolve: (response: APIResponse) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

// Message types for main ↔ UI communication
export interface APIRequestMessage {
  type: 'API_REQUEST';
  requestId: string;
  payload: APIRequest;
}

export interface APIResponseMessage {
  type: 'API_RESPONSE';
  requestId: string;
  response: APIResponse;
}

export interface APIErrorMessage {
  type: 'API_ERROR';
  requestId: string;
  error: string;
}

// ============================================================================
// PluginAPIClient - Main Thread Side
// ============================================================================

/**
 * API client for use in Figma plugin main thread.
 * Relays requests through the UI iframe which has fetch access.
 */
export class PluginAPIClient {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private defaultTimeout: number = 30000; // 30 seconds
  private requestCounter: number = 0;

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestCounter}`;
  }

  /**
   * Send a request to an external API via the UI iframe
   */
  async request<T = unknown>(req: APIRequest): Promise<APIResponse<T>> {
    const requestId = this.generateRequestId();
    const requestedAt = Date.now();

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        resolve({
          success: false,
          status: 0,
          error: `Request timed out after ${req.timeout || this.defaultTimeout}ms`,
          timing: {
            requestedAt,
            completedAt: Date.now(),
            durationMs: Date.now() - requestedAt,
          },
        });
      }, req.timeout || this.defaultTimeout);

      // Store pending request
      this.pendingRequests.set(requestId, {
        requestId,
        resolve: resolve as (response: APIResponse) => void,
        reject,
        timeout,
      });

      // Send request to UI
      const message: APIRequestMessage = {
        type: 'API_REQUEST',
        requestId,
        payload: req,
      };

      figma.ui.postMessage(message);
    });
  }

  /**
   * Handle response from UI
   */
  handleResponse(message: APIResponseMessage | APIErrorMessage): void {
    const pending = this.pendingRequests.get(message.requestId);
    if (!pending) {
      console.warn(`No pending request found for ${message.requestId}`);
      return;
    }

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(message.requestId);

    if (message.type === 'API_ERROR') {
      pending.resolve({
        success: false,
        status: 0,
        error: message.error,
        timing: {
          requestedAt: 0,
          completedAt: Date.now(),
          durationMs: 0,
        },
      });
    } else {
      pending.resolve(message.response);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAll(): void {
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.resolve({
        success: false,
        status: 0,
        error: 'Request cancelled',
        timing: {
          requestedAt: 0,
          completedAt: Date.now(),
          durationMs: 0,
        },
      });
    }
    this.pendingRequests.clear();
  }

  // ============================================================================
  // Convenience Methods
  // ============================================================================

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>({ endpoint, method: 'GET', headers });
  }

  /**
   * POST request
   */
  async post<T = unknown>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>({ endpoint, method: 'POST', data, headers });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>({ endpoint, method: 'PUT', data, headers });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>({ endpoint, method: 'DELETE', headers });
  }

  // ============================================================================
  // Test Methods
  // ============================================================================

  /**
   * Test connectivity with a simple echo endpoint
   */
  async testConnection(endpoint: string = 'https://httpbin.org/post'): Promise<{
    success: boolean;
    roundTripMs: number;
    error?: string;
  }> {
    const testPayload = {
      test: true,
      timestamp: Date.now(),
      source: 'figma-plugin',
    };

    const response = await this.post(endpoint, testPayload);

    return {
      success: response.success,
      roundTripMs: response.timing.durationMs,
      error: response.error,
    };
  }

  /**
   * Send extracted component data to admin tool
   */
  async sendComponentData(
    endpoint: string,
    componentData: unknown
  ): Promise<APIResponse<{ received: boolean; componentId?: string }>> {
    return this.post(endpoint, {
      type: 'component-import',
      data: componentData,
      timestamp: Date.now(),
    });
  }
}

// Singleton instance for easy access
export const apiClient = new PluginAPIClient();

// ============================================================================
// ComponentExportClient - Specialized Export Client (Chunk 4.04)
// ============================================================================

/**
 * @chunk 4.04 - PluginAPIClient
 * 
 * Specialized client for exporting components to the Admin Tool API.
 * Handles chunking, progress callbacks, retry logic, and authentication.
 */
export class ComponentExportClient {
  private apiUrl: string;
  private authToken?: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor(options: ExportOptions) {
    this.apiUrl = options.apiUrl.replace(/\/$/, '');
    this.authToken = options.authToken;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
  }

  /**
   * Export components to the Admin Tool API
   * Handles chunking for large payloads and provides progress updates
   */
  async exportComponents(
    payload: ExportPayload,
    onProgress?: (progress: number) => void
  ): Promise<ExportResult> {
    const chunks = this.chunkPayload(payload);
    let importId: string | null = null;
    
    for (let i = 0; i < chunks.length; i++) {
      const response = await this.sendChunkWithRetry(chunks[i], importId);
      importId = response.importId;
      
      if (onProgress) {
        onProgress(((i + 1) / chunks.length) * 100);
      }
    }

    return {
      success: true,
      importId: importId!,
      status: 'pending',
    };
  }

  /**
   * Convenience method matching user requirements
   * sendComponents(apiUrl, components, images)
   */
  async sendComponents(
    apiUrl: string,
    components: ExportPayload['components'],
    images: ExportPayload['images'],
    metadata?: Partial<ExportPayload['metadata']>
  ): Promise<ExportResult> {
    const payload: ExportPayload = {
      components,
      images,
      metadata: {
        fileKey: metadata?.fileKey ?? '',
        fileName: metadata?.fileName ?? '',
        exportedAt: metadata?.exportedAt ?? new Date().toISOString(),
        figmaFileId: metadata?.figmaFileId,
        figmaFileName: metadata?.figmaFileName,
      },
    };

    return this.exportComponents(payload);
  }

  /**
   * Chunk payload if it exceeds size limits
   */
  private chunkPayload(payload: ExportPayload): ExportPayload[] {
    const payloadSize = JSON.stringify(payload).length;
    
    // If small enough, return as-is (1MB threshold)
    if (payloadSize < 1_000_000) {
      return [payload];
    }

    // Otherwise, split by component
    const chunks: ExportPayload[] = [];
    const COMPONENTS_PER_CHUNK = 5;

    for (let i = 0; i < payload.components.length; i += COMPONENTS_PER_CHUNK) {
      const componentSlice = payload.components.slice(i, i + COMPONENTS_PER_CHUNK);
      const componentIds = new Set(componentSlice.map(c => c.id));
      
      // Include only images for these components
      const imageSlice = payload.images.filter(img => {
        // Extract component ID from nodeId (format: "componentId/variantId" or just "componentId")
        const componentId = img.nodeId.split('/')[0];
        return componentIds.has(componentId);
      });

      chunks.push({
        components: componentSlice,
        images: imageSlice,
        metadata: payload.metadata,
      });
    }

    return chunks;
  }

  /**
   * Send a chunk with retry logic
   */
  private async sendChunkWithRetry(
    chunk: ExportPayload,
    existingImportId: string | null,
    attempt: number = 1
  ): Promise<{ importId: string; status?: 'pending' | 'complete' }> {
    try {
      return await this.sendChunk(chunk, existingImportId);
    } catch (error) {
      // Retry on network errors or 5xx status codes
      const shouldRetry = 
        attempt < this.maxRetries &&
        (error instanceof TypeError || // Network error
         (error instanceof Error && error.message.includes('5'))); // 5xx error

      if (shouldRetry) {
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.sendChunkWithRetry(chunk, existingImportId, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Send a single chunk to the API
   */
  private async sendChunk(
    chunk: ExportPayload,
    existingImportId: string | null
  ): Promise<{ importId: string; status?: 'pending' | 'complete' }> {
    const endpoint = existingImportId
      ? `${this.apiUrl}/api/figma-import/${existingImportId}/chunk`
      : `${this.apiUrl}/api/figma-import`;

    // Build headers with authentication if provided
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Use the generic API client to send the request
    const response = await apiClient.post<{ importId: string; status?: 'pending' | 'complete' }>(
      endpoint,
      chunk,
      headers
    );

    if (!response.success || !response.data) {
      const errorMessage = response.error || `API error ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.data;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

