/**
 * @chunk 0.04 - Figma Plugin PoC - API Communication
 * 
 * UI-side fetch handler. This module runs in the UI iframe and handles
 * actual HTTP requests on behalf of the plugin main thread.
 */

import type { APIRequest, APIResponse, APIRequestMessage, APIResponseMessage, APIErrorMessage } from './client';

// ============================================================================
// UIFetchHandler - UI Iframe Side
// ============================================================================

/**
 * Handles API requests from the plugin main thread.
 * Performs actual fetch calls and returns results.
 */
export class UIFetchHandler {
  private isListening: boolean = false;

  /**
   * Start listening for API requests from the plugin
   */
  startListening(): void {
    if (this.isListening) return;
    
    window.addEventListener('message', this.handleMessage);
    this.isListening = true;
    console.log('[UIFetchHandler] Started listening for API requests');
  }

  /**
   * Stop listening for API requests
   */
  stopListening(): void {
    window.removeEventListener('message', this.handleMessage);
    this.isListening = false;
    console.log('[UIFetchHandler] Stopped listening for API requests');
  }

  /**
   * Handle incoming messages from plugin
   */
  private handleMessage = async (event: MessageEvent): void => {
    const msg = event.data?.pluginMessage;
    if (!msg || msg.type !== 'API_REQUEST') return;

    const request = msg as APIRequestMessage;
    console.log(`[UIFetchHandler] Received request: ${request.requestId}`);

    try {
      const response = await this.executeRequest(request.payload);
      this.sendResponse(request.requestId, response);
    } catch (error) {
      this.sendError(request.requestId, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  /**
   * Execute the actual fetch request
   */
  private async executeRequest(req: APIRequest): Promise<APIResponse> {
    const requestedAt = Date.now();

    try {
      const fetchOptions: RequestInit = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          ...req.headers,
        },
      };

      // Add body for POST/PUT requests
      if (req.data && (req.method === 'POST' || req.method === 'PUT')) {
        fetchOptions.body = JSON.stringify(req.data);
      }

      console.log(`[UIFetchHandler] Fetching: ${req.method} ${req.endpoint}`);
      
      const response = await fetch(req.endpoint, fetchOptions);
      const completedAt = Date.now();

      // Try to parse response as JSON
      let data: unknown;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = await response.text();
        }
      } else {
        data = await response.text();
      }

      return {
        success: response.ok,
        status: response.status,
        data,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
        timing: {
          requestedAt,
          completedAt,
          durationMs: completedAt - requestedAt,
        },
      };
    } catch (error) {
      const completedAt = Date.now();
      
      // Handle network errors, CORS errors, etc.
      let errorMessage = 'Network error';
      
      if (error instanceof TypeError) {
        // TypeError usually indicates CORS or network issues
        errorMessage = `Network error: ${error.message}. This may be a CORS issue.`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        status: 0,
        error: errorMessage,
        timing: {
          requestedAt,
          completedAt,
          durationMs: completedAt - requestedAt,
        },
      };
    }
  }

  /**
   * Send successful response back to plugin
   */
  private sendResponse(requestId: string, response: APIResponse): void {
    const message: APIResponseMessage = {
      type: 'API_RESPONSE',
      requestId,
      response,
    };
    
    parent.postMessage({ pluginMessage: message }, '*');
    console.log(`[UIFetchHandler] Sent response for: ${requestId}`);
  }

  /**
   * Send error response back to plugin
   */
  private sendError(requestId: string, error: string): void {
    const message: APIErrorMessage = {
      type: 'API_ERROR',
      requestId,
      error,
    };
    
    parent.postMessage({ pluginMessage: message }, '*');
    console.log(`[UIFetchHandler] Sent error for: ${requestId}`, error);
  }
}

// Singleton instance
export const uiFetchHandler = new UIFetchHandler();

// ============================================================================
// Test Endpoints
// ============================================================================

/**
 * Known test endpoints for validation
 */
export const TEST_ENDPOINTS = {
  // httpbin.org - popular HTTP testing service
  echo: 'https://httpbin.org/post',
  get: 'https://httpbin.org/get',
  delay: (seconds: number) => `https://httpbin.org/delay/${seconds}`,
  status: (code: number) => `https://httpbin.org/status/${code}`,
  
  // JSONPlaceholder - fake REST API
  posts: 'https://jsonplaceholder.typicode.com/posts',
  postById: (id: number) => `https://jsonplaceholder.typicode.com/posts/${id}`,
};

/**
 * Run a suite of connection tests
 */
export async function runConnectionTests(): Promise<{
  tests: Array<{
    name: string;
    endpoint: string;
    success: boolean;
    durationMs: number;
    error?: string;
  }>;
  summary: {
    passed: number;
    failed: number;
    totalMs: number;
  };
}> {
  const tests: Array<{
    name: string;
    endpoint: string;
    success: boolean;
    durationMs: number;
    error?: string;
  }> = [];

  // Test 1: Simple GET
  const getStart = Date.now();
  try {
    const getResponse = await fetch(TEST_ENDPOINTS.get);
    tests.push({
      name: 'GET request',
      endpoint: TEST_ENDPOINTS.get,
      success: getResponse.ok,
      durationMs: Date.now() - getStart,
    });
  } catch (e) {
    tests.push({
      name: 'GET request',
      endpoint: TEST_ENDPOINTS.get,
      success: false,
      durationMs: Date.now() - getStart,
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }

  // Test 2: POST with JSON body
  const postStart = Date.now();
  try {
    const postResponse = await fetch(TEST_ENDPOINTS.echo, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true, timestamp: Date.now() }),
    });
    tests.push({
      name: 'POST with JSON',
      endpoint: TEST_ENDPOINTS.echo,
      success: postResponse.ok,
      durationMs: Date.now() - postStart,
    });
  } catch (e) {
    tests.push({
      name: 'POST with JSON',
      endpoint: TEST_ENDPOINTS.echo,
      success: false,
      durationMs: Date.now() - postStart,
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }

  // Test 3: Large payload
  const largeStart = Date.now();
  const largePayload = {
    data: Array(100).fill(null).map((_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    })),
  };
  try {
    const largeResponse = await fetch(TEST_ENDPOINTS.echo, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(largePayload),
    });
    tests.push({
      name: 'Large payload (~15KB)',
      endpoint: TEST_ENDPOINTS.echo,
      success: largeResponse.ok,
      durationMs: Date.now() - largeStart,
    });
  } catch (e) {
    tests.push({
      name: 'Large payload (~15KB)',
      endpoint: TEST_ENDPOINTS.echo,
      success: false,
      durationMs: Date.now() - largeStart,
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }

  const passed = tests.filter(t => t.success).length;
  const failed = tests.filter(t => !t.success).length;
  const totalMs = tests.reduce((sum, t) => sum + t.durationMs, 0);

  return {
    tests,
    summary: { passed, failed, totalMs },
  };
}


