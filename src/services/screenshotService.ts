/**
 * @chunk 7.04 - Screenshot + DOM Capture Service (Client)
 *
 * Client service to invoke the capture-with-dom Supabase Edge Function.
 * Captures webpage screenshots AND extracts DOM element bounds.
 */

import { supabase } from '../lib/supabase';

/**
 * DOM element extracted from a captured page
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
 * Result from the capture-with-dom function
 */
export interface CaptureResult {
  screenshot: string;
  viewport: { width: number; height: number };
  elements: DOMElement[];
}

/**
 * Viewport configuration for page capture
 */
export interface Viewport {
  width: number;
  height: number;
}

/**
 * Capture a webpage screenshot and extract DOM elements with their bounds and styles.
 *
 * @param url - The URL to capture (must be http:// or https://)
 * @param viewport - Optional viewport dimensions (defaults to 1440x900)
 * @returns Screenshot (base64), viewport dimensions, and extracted DOM elements
 */
export async function captureWithDom(
  url: string,
  viewport?: Viewport
): Promise<CaptureResult> {
  const { data, error } = await supabase.functions.invoke('capture-with-dom', {
    body: { url, viewport },
  });

  if (error) {
    throw new Error(`Failed to capture page: ${error.message}`);
  }

  return data as CaptureResult;
}
