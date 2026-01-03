/**
 * @chunk 0.04 - Figma Plugin PoC - API Communication
 * 
 * API client wrapper for communicating with external services from the Figma plugin.
 * Since the plugin main thread has no fetch access, this uses message passing to the UI.
 */

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

