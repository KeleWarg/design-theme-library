/**
 * @chunk 0.01, 0.02, 0.03, 0.04 - Figma Plugin PoC Setup + Component Extraction + Image Export + API Communication
 * 
 * Main plugin entry point - runs in Figma's sandbox environment.
 * Handles communication between Figma API and the UI.
 */

import { 
  extractSelectedComponents, 
  getExtractionCapabilities,
  type ExtractionResult 
} from './extractors/component';

import {
  ImageExporter,
  type ExportOptions,
  type ExportBenchmark,
} from './extractors/images';

import {
  apiClient,
  type APIResponseMessage,
  type APIErrorMessage,
} from './api/client';

// Show the plugin UI
figma.showUI(__html__, {
  width: 450,
  height: 600,
  title: 'Design System Admin PoC'
});

// Types for message passing
interface PluginMessage {
  type: string;
  payload?: unknown;
}

interface PageInfo {
  id: string;
  name: string;
  childCount: number;
}

interface SelectionInfo {
  id: string;
  name: string;
  type: string;
  isComponent: boolean;
  canExport: boolean;
  dimensions: { width: number; height: number };
}

// Get current page information
function getCurrentPageInfo(): PageInfo {
  const page = figma.currentPage;
  return {
    id: page.id,
    name: page.name,
    childCount: page.children.length
  };
}

// Get current selection information
function getSelectionInfo(): SelectionInfo[] {
  return figma.currentPage.selection.map(node => ({
    id: node.id,
    name: node.name,
    type: node.type,
    isComponent: node.type === 'COMPONENT' || node.type === 'COMPONENT_SET',
    canExport: ImageExporter.canExport(node),
    dimensions: ImageExporter.getNodeDimensions(node),
  }));
}

// Handle messages from UI
figma.ui.onmessage = async (msg: PluginMessage) => {
  console.log('Plugin received message:', msg.type);

  switch (msg.type) {
    case 'get-page-info':
      figma.ui.postMessage({
        type: 'page-info',
        payload: getCurrentPageInfo()
      });
      break;

    case 'get-selection':
      figma.ui.postMessage({
        type: 'selection-info',
        payload: getSelectionInfo()
      });
      break;

    case 'extract-components':
      try {
        const results = await extractSelectedComponents();
        figma.ui.postMessage({
          type: 'extraction-result',
          payload: results
        });
      } catch (error) {
        figma.ui.postMessage({
          type: 'extraction-error',
          payload: { error: error instanceof Error ? error.message : String(error) }
        });
      }
      break;

    case 'get-capabilities':
      figma.ui.postMessage({
        type: 'capabilities',
        payload: getExtractionCapabilities()
      });
      break;

    case 'ping':
      figma.ui.postMessage({
        type: 'pong',
        payload: { timestamp: Date.now() }
      });
      break;

    case 'close':
      figma.closePlugin();
      break;

    // ========================================================================
    // Image Export (Chunk 0.03)
    // ========================================================================

    case 'export-selection': {
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.ui.postMessage({
          type: 'export-error',
          payload: { error: 'No selection to export' }
        });
        break;
      }

      const options = msg.payload as ExportOptions | undefined;
      
      try {
        const results = options
          ? await ImageExporter.exportNodes(selection, options)
          : await ImageExporter.exportNodesAuto(selection);
        
        figma.ui.postMessage({
          type: 'export-complete',
          payload: results
        });
        
        figma.notify(`Exported ${results.success.length} image${results.success.length !== 1 ? 's' : ''}`);
      } catch (err) {
        figma.ui.postMessage({
          type: 'export-error',
          payload: { error: err instanceof Error ? err.message : 'Export failed' }
        });
      }
      break;
    }

    case 'export-single': {
      const { nodeId, options } = msg.payload as { nodeId: string; options?: ExportOptions };
      const node = figma.getNodeById(nodeId) as SceneNode | null;
      
      if (!node) {
        figma.ui.postMessage({
          type: 'export-error',
          payload: { error: `Node ${nodeId} not found` }
        });
        break;
      }

      try {
        const result = options
          ? await ImageExporter.exportNode(node, options)
          : await ImageExporter.exportNodeAuto(node);
        
        figma.ui.postMessage({
          type: 'export-single-complete',
          payload: result
        });
      } catch (err) {
        figma.ui.postMessage({
          type: 'export-error',
          payload: { error: err instanceof Error ? err.message : 'Export failed' }
        });
      }
      break;
    }

    case 'benchmark-selection': {
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.ui.postMessage({
          type: 'benchmark-error',
          payload: { error: 'No selection to benchmark' }
        });
        break;
      }

      try {
        const allBenchmarks: ExportBenchmark[] = [];
        
        for (const node of selection) {
          if (ImageExporter.canExport(node)) {
            const nodeBenchmarks = await ImageExporter.benchmarkNode(node);
            allBenchmarks.push(...nodeBenchmarks);
          }
        }
        
        const report = ImageExporter.formatBenchmarkReport(allBenchmarks);
        
        figma.ui.postMessage({
          type: 'benchmark-complete',
          payload: { benchmarks: allBenchmarks, report }
        });
        
        console.log(report);
        figma.notify(`Benchmark complete for ${selection.length} node${selection.length !== 1 ? 's' : ''}`);
      } catch (err) {
        figma.ui.postMessage({
          type: 'benchmark-error',
          payload: { error: err instanceof Error ? err.message : 'Benchmark failed' }
        });
      }
      break;
    }

    case 'get-export-config': {
      const { nodeType } = msg.payload as { nodeType: string };
      const config = ImageExporter.getRecommendedConfig(nodeType);
      
      figma.ui.postMessage({
        type: 'export-config',
        payload: config
      });
      break;
    }

    // ========================================================================
    // API Communication (Chunk 0.04)
    // ========================================================================

    case 'API_RESPONSE':
    case 'API_ERROR': {
      // Forward API responses from UI back to the apiClient
      apiClient.handleResponse(msg as APIResponseMessage | APIErrorMessage);
      break;
    }

    case 'test-api-connection': {
      const { endpoint } = msg.payload as { endpoint?: string };
      
      try {
        const result = await apiClient.testConnection(endpoint);
        figma.ui.postMessage({
          type: 'api-test-result',
          payload: result
        });
        
        if (result.success) {
          figma.notify(`API connection successful (${result.roundTripMs}ms)`);
        } else {
          figma.notify(`API connection failed: ${result.error}`, { error: true });
        }
      } catch (err) {
        figma.ui.postMessage({
          type: 'api-test-result',
          payload: { 
            success: false, 
            roundTripMs: 0, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          }
        });
      }
      break;
    }

    case 'send-component-to-api': {
      const { endpoint, componentData } = msg.payload as { 
        endpoint: string; 
        componentData: unknown 
      };
      
      try {
        const response = await apiClient.sendComponentData(endpoint, componentData);
        figma.ui.postMessage({
          type: 'api-send-result',
          payload: response
        });
        
        if (response.success) {
          figma.notify('Component data sent successfully');
        } else {
          figma.notify(`Failed to send: ${response.error}`, { error: true });
        }
      } catch (err) {
        figma.ui.postMessage({
          type: 'api-send-result',
          payload: { 
            success: false,
            status: 0,
            error: err instanceof Error ? err.message : 'Unknown error',
            timing: { requestedAt: 0, completedAt: Date.now(), durationMs: 0 }
          }
        });
      }
      break;
    }

    case 'api-request': {
      // Generic API request from UI
      const { endpoint, method, data, headers } = msg.payload as {
        endpoint: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        data?: unknown;
        headers?: Record<string, string>;
      };
      
      try {
        const response = await apiClient.request({ endpoint, method, data, headers });
        figma.ui.postMessage({
          type: 'api-response',
          payload: response
        });
      } catch (err) {
        figma.ui.postMessage({
          type: 'api-response',
          payload: { 
            success: false,
            status: 0,
            error: err instanceof Error ? err.message : 'Unknown error',
            timing: { requestedAt: 0, completedAt: Date.now(), durationMs: 0 }
          }
        });
      }
      break;
    }

    default:
      console.warn('Unknown message type:', msg.type);
  }
};

// Listen for selection changes
figma.on('selectionchange', () => {
  figma.ui.postMessage({
    type: 'selection-changed',
    payload: getSelectionInfo()
  });
});

// Initial page info on load
figma.ui.postMessage({
  type: 'plugin-ready',
  payload: {
    pageInfo: getCurrentPageInfo(),
    selection: getSelectionInfo(),
    capabilities: getExtractionCapabilities()
  }
});

console.log('Design System Admin PoC plugin loaded');
