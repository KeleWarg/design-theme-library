/**
 * @chunk 0.01, 0.02, 0.03, 0.04 - Figma Plugin PoC Setup + Component Extraction + Image Export + API Communication
 * 
 * Plugin UI - React-based interface that communicates with the main plugin code.
 * Includes component extraction, image export, and API communication testing functionality.
 */

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { uiFetchHandler, runConnectionTests } from './api/ui-fetch';
import ComponentsTab from './ui/ComponentsTab';

// Types
interface PageInfo {
  id: string;
  name: string;
  childCount: number;
}

interface SelectionInfo {
  id: string;
  name: string;
  type: string;
  isComponent?: boolean;
  canExport?: boolean;
  dimensions?: { width: number; height: number };
}

interface ExtractedProperty {
  name: string;
  type: string;
  defaultValue?: string | boolean;
  variantOptions?: string[];
}

interface ExtractedVariant {
  id: string;
  name: string;
  properties: Record<string, string>;
}

interface BoundVariable {
  nodeId: string;
  nodeName: string;
  property: string;
  variableId: string;
  variableName: string;
}

interface ExtractedComponent {
  id: string;
  name: string;
  description: string;
  type: 'COMPONENT' | 'COMPONENT_SET';
  properties: ExtractedProperty[];
  variants?: ExtractedVariant[];
  boundVariables: BoundVariable[];
  warnings: string[];
}

interface ExtractionResult {
  success: boolean;
  component?: ExtractedComponent;
  error?: string;
  warnings: string[];
}

// Image Export Types (Chunk 0.03)
interface ImageExportResult {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  format: string;
  scale: number;
  sizeBytes: number;
  exportTimeMs: number;
  base64: string;
}

interface ImageExportError {
  nodeId: string;
  nodeName: string;
  error: string;
}

interface ImageExportState {
  loading: boolean;
  results: ImageExportResult[] | null;
  errors: ImageExportError[] | null;
  benchmarkReport: string | null;
}

// API Communication Types (Chunk 0.04)
interface APITestResult {
  success: boolean;
  roundTripMs: number;
  error?: string;
}

interface APIResponse {
  success: boolean;
  status: number;
  data?: unknown;
  error?: string;
  timing: {
    requestedAt: number;
    completedAt: number;
    durationMs: number;
  };
}

interface ConnectionTestResult {
  name: string;
  endpoint: string;
  success: boolean;
  durationMs: number;
  error?: string;
}

interface APIState {
  testing: boolean;
  testResult: APITestResult | null;
  connectionTests: ConnectionTestResult[] | null;
  sendResult: APIResponse | null;
  customEndpoint: string;
}

interface Capabilities {
  [key: string]: boolean;
}

interface PluginState {
  ready: boolean;
  pageInfo: PageInfo | null;
  selection: SelectionInfo[];
  lastPong: number | null;
  capabilities: Capabilities | null;
  extractionResults: ExtractionResult[] | null;
  isExtracting: boolean;
  activeTab: 'status' | 'extraction' | 'results' | 'export' | 'api' | 'components';
  imageExport: ImageExportState;
  api: APIState;
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    padding: '16px',
    fontSize: '13px',
    color: '#333',
    height: '100%',
    overflowY: 'auto',
  },
  header: {
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e5e5',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
  },
  subtitle: {
    margin: 0,
    color: '#666',
    fontSize: '12px',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '16px',
    borderBottom: '1px solid #e5e5e5',
    paddingBottom: '8px',
  },
  tab: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#666',
  },
  tabActive: {
    backgroundColor: '#18A0FB',
    color: 'white',
  },
  section: {
    marginBottom: '16px',
  },
  sectionTitle: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: '#666',
  },
  card: {
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  label: {
    fontSize: '11px',
    color: '#666',
    marginBottom: '2px',
  },
  value: {
    fontSize: '13px',
    fontWeight: 500,
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#18A0FB',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    marginRight: '8px',
    marginBottom: '8px',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  buttonSecondary: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    marginRight: '8px',
    marginBottom: '8px',
  },
  buttonSuccess: {
    backgroundColor: '#1BC47D',
  },
  status: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  emptyState: {
    padding: '24px',
    textAlign: 'center' as const,
    color: '#666',
    backgroundColor: '#fafafa',
    borderRadius: '6px',
    border: '1px dashed #ddd',
  },
  selectionItem: {
    padding: '8px 12px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    marginBottom: '4px',
    border: '1px solid #e5e5e5',
  },
  componentBadge: {
    display: 'inline-block',
    padding: '2px 6px',
    backgroundColor: '#9747FF',
    color: 'white',
    borderRadius: '3px',
    fontSize: '10px',
    fontWeight: 600,
    marginLeft: '6px',
  },
  capabilityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid #eee',
  },
  capabilityCheck: {
    color: '#1BC47D',
    fontWeight: 600,
  },
  capabilityX: {
    color: '#F24E1E',
    fontWeight: 600,
  },
  resultCard: {
    padding: '12px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    marginBottom: '12px',
    border: '1px solid #e5e5e5',
  },
  resultSuccess: {
    borderLeft: '3px solid #1BC47D',
  },
  resultError: {
    borderLeft: '3px solid #F24E1E',
  },
  warning: {
    padding: '6px 8px',
    backgroundColor: '#FFF8E6',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#B8860B',
    marginTop: '6px',
  },
  codeBlock: {
    fontFamily: 'monospace',
    fontSize: '11px',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: '12px',
    borderRadius: '6px',
    overflow: 'auto',
    maxHeight: '200px',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
  },
  propertyTag: {
    display: 'inline-block',
    padding: '2px 6px',
    backgroundColor: '#E8F4FD',
    color: '#0969DA',
    borderRadius: '3px',
    fontSize: '10px',
    fontWeight: 500,
    marginRight: '4px',
    marginBottom: '4px',
  },
  // Image Export styles (Chunk 0.03)
  select: {
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '12px',
    marginRight: '8px',
    marginBottom: '8px',
    backgroundColor: '#fff',
  },
  exportResultCard: {
    padding: '10px 12px',
    backgroundColor: '#E8F5E9',
    borderRadius: '4px',
    marginBottom: '6px',
    border: '1px solid #C8E6C9',
  },
  exportErrorCard: {
    padding: '10px 12px',
    backgroundColor: '#FFEBEE',
    borderRadius: '4px',
    marginBottom: '6px',
    border: '1px solid #FFCDD2',
  },
  benchmarkPre: {
    fontSize: '10px',
    fontFamily: 'monospace',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: '12px',
    borderRadius: '6px',
    overflow: 'auto',
    maxHeight: '250px',
    whiteSpace: 'pre' as const,
  },
  imageThumbnail: {
    maxWidth: '100%',
    maxHeight: '100px',
    borderRadius: '4px',
    marginTop: '8px',
    border: '1px solid #e5e5e5',
  },
  formatBadge: {
    display: 'inline-block',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '10px',
    fontWeight: 600,
    marginLeft: '6px',
  },
  // API Communication styles (Chunk 0.04)
  input: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '12px',
    fontFamily: 'monospace',
    marginBottom: '8px',
    boxSizing: 'border-box' as const,
  },
  apiResultCard: {
    padding: '12px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    marginBottom: '8px',
    border: '1px solid #e5e5e5',
  },
  apiSuccess: {
    borderLeft: '3px solid #1BC47D',
  },
  apiError: {
    borderLeft: '3px solid #F24E1E',
  },
  timing: {
    display: 'inline-block',
    padding: '2px 6px',
    backgroundColor: '#E8F4FD',
    color: '#0969DA',
    borderRadius: '3px',
    fontSize: '10px',
    fontWeight: 500,
  },
  testItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
};

function App() {
  const [state, setState] = useState<PluginState>({
    ready: false,
    pageInfo: null,
    selection: [],
    lastPong: null,
    capabilities: null,
    extractionResults: null,
    isExtracting: false,
    activeTab: 'status',
    imageExport: {
      loading: false,
      results: null,
      errors: null,
      benchmarkReport: null,
    },
    api: {
      testing: false,
      testResult: null,
      connectionTests: null,
      sendResult: null,
      customEndpoint: 'https://httpbin.org/post',
    },
  });

  // Image export settings (Chunk 0.03)
  const [exportFormat, setExportFormat] = useState<'PNG' | 'SVG' | 'JPG' | 'auto'>('auto');
  const [exportScale, setExportScale] = useState<1 | 2 | 3>(2);

  // Initialize UI fetch handler (Chunk 0.04)
  useEffect(() => {
    uiFetchHandler.startListening();
    return () => uiFetchHandler.stopListening();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      console.log('UI received message:', msg.type);

      switch (msg.type) {
        case 'plugin-ready':
          setState(prev => ({
            ...prev,
            ready: true,
            pageInfo: msg.payload.pageInfo,
            selection: msg.payload.selection,
            capabilities: msg.payload.capabilities,
          }));
          break;

        case 'page-info':
          setState(prev => ({ ...prev, pageInfo: msg.payload }));
          break;

        case 'selection-info':
        case 'selection-changed':
          setState(prev => ({ ...prev, selection: msg.payload }));
          break;

        case 'pong':
          setState(prev => ({ ...prev, lastPong: msg.payload.timestamp }));
          break;

        case 'capabilities':
          setState(prev => ({ ...prev, capabilities: msg.payload }));
          break;

        case 'extraction-result':
          setState(prev => ({
            ...prev,
            extractionResults: msg.payload,
            isExtracting: false,
            activeTab: 'results',
          }));
          break;

        case 'extraction-error':
          setState(prev => ({
            ...prev,
            extractionResults: [{
              success: false,
              error: msg.payload.error,
              warnings: [],
            }],
            isExtracting: false,
            activeTab: 'results',
          }));
          break;

        // Image Export messages (Chunk 0.03)
        case 'export-complete':
          setState(prev => ({
            ...prev,
            imageExport: {
              loading: false,
              results: msg.payload.success,
              errors: msg.payload.errors?.length > 0 ? msg.payload.errors : null,
              benchmarkReport: null,
            },
          }));
          break;

        case 'export-single-complete':
          setState(prev => ({
            ...prev,
            imageExport: {
              loading: false,
              results: [msg.payload],
              errors: null,
              benchmarkReport: null,
            },
          }));
          break;

        case 'export-error':
          setState(prev => ({
            ...prev,
            imageExport: {
              loading: false,
              results: null,
              errors: [{ nodeId: '', nodeName: '', error: msg.payload.error }],
              benchmarkReport: null,
            },
          }));
          break;

        case 'benchmark-complete':
          setState(prev => ({
            ...prev,
            imageExport: {
              loading: false,
              results: null,
              errors: null,
              benchmarkReport: msg.payload.report,
            },
          }));
          break;

        case 'benchmark-error':
          setState(prev => ({
            ...prev,
            imageExport: {
              loading: false,
              results: null,
              errors: [{ nodeId: '', nodeName: '', error: msg.payload.error }],
              benchmarkReport: null,
            },
          }));
          break;

        // API Communication messages (Chunk 0.04)
        case 'api-test-result':
          setState(prev => ({
            ...prev,
            api: {
              ...prev.api,
              testing: false,
              testResult: msg.payload,
            },
          }));
          break;

        case 'api-send-result':
        case 'api-response':
          setState(prev => ({
            ...prev,
            api: {
              ...prev.api,
              testing: false,
              sendResult: msg.payload,
            },
          }));
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendMessage = (type: string, payload?: unknown) => {
    parent.postMessage({ pluginMessage: { type, payload } }, '*');
  };

  const handleExtract = () => {
    setState(prev => ({ ...prev, isExtracting: true }));
    sendMessage('extract-components');
  };

  const hasComponentSelected = state.selection.some(s => s.isComponent);

  // Image Export handlers (Chunk 0.03)
  const handleExport = () => {
    setState(prev => ({
      ...prev,
      imageExport: { loading: true, results: null, errors: null, benchmarkReport: null },
    }));
    
    if (exportFormat === 'auto') {
      sendMessage('export-selection');
    } else {
      sendMessage('export-selection', { format: exportFormat, scale: exportScale });
    }
  };

  const handleBenchmark = () => {
    setState(prev => ({
      ...prev,
      imageExport: { loading: true, results: null, errors: null, benchmarkReport: null },
    }));
    sendMessage('benchmark-selection');
  };

  const clearExportResults = () => {
    setState(prev => ({
      ...prev,
      imageExport: { loading: false, results: null, errors: null, benchmarkReport: null },
    }));
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFormatColor = (format: string): string => {
    switch (format) {
      case 'PNG': return '#4CAF50';
      case 'SVG': return '#2196F3';
      case 'JPG': return '#FF9800';
      default: return '#666';
    }
  };

  const exportableCount = state.selection.filter(s => s.canExport).length;

  // API Communication handlers (Chunk 0.04)
  const handleTestConnection = () => {
    setState(prev => ({
      ...prev,
      api: { ...prev.api, testing: true, testResult: null },
    }));
    sendMessage('test-api-connection', { endpoint: state.api.customEndpoint });
  };

  const handleRunConnectionTests = async () => {
    setState(prev => ({
      ...prev,
      api: { ...prev.api, testing: true, connectionTests: null },
    }));
    
    try {
      const results = await runConnectionTests();
      setState(prev => ({
        ...prev,
        api: { ...prev.api, testing: false, connectionTests: results.tests },
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        api: { 
          ...prev.api, 
          testing: false, 
          connectionTests: [{ 
            name: 'Connection test', 
            endpoint: '', 
            success: false, 
            durationMs: 0, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          }] 
        },
      }));
    }
  };

  const handleSendExtractedComponent = () => {
    if (!state.extractionResults || state.extractionResults.length === 0) return;
    
    const successfulExtractions = state.extractionResults.filter(r => r.success && r.component);
    if (successfulExtractions.length === 0) return;
    
    setState(prev => ({
      ...prev,
      api: { ...prev.api, testing: true, sendResult: null },
    }));
    
    sendMessage('send-component-to-api', {
      endpoint: state.api.customEndpoint,
      componentData: successfulExtractions[0].component,
    });
  };

  const clearApiResults = () => {
    setState(prev => ({
      ...prev,
      api: { ...prev.api, testResult: null, connectionTests: null, sendResult: null },
    }));
  };

  const hasExtractedComponent = state.extractionResults?.some(r => r.success && r.component) ?? false;

  // Tab content renderers
  const renderStatusTab = () => (
    <>
      {/* Connection Status */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Status</h2>
        <div style={styles.card}>
          <div style={styles.status}>
            <span style={{ ...styles.statusDot, backgroundColor: state.ready ? '#1BC47D' : '#F24E1E' }} />
            <span>{state.ready ? 'Connected to Figma' : 'Connecting...'}</span>
          </div>
          {state.lastPong && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              Last ping: {new Date(state.lastPong).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Page Info */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Current Page</h2>
        {state.pageInfo ? (
          <div style={styles.card}>
            <div style={styles.label}>Name</div>
            <div style={styles.value}>{state.pageInfo.name}</div>
            <div style={{ marginTop: '8px' }}>
              <div style={styles.label}>Children</div>
              <div style={styles.value}>{state.pageInfo.childCount} nodes</div>
            </div>
          </div>
        ) : (
          <div style={styles.emptyState}>Loading...</div>
        )}
      </div>

      {/* Selection */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Selection ({state.selection.length})</h2>
        {state.selection.length > 0 ? (
          <div>
            {state.selection.slice(0, 5).map(item => (
              <div key={item.id} style={styles.selectionItem}>
                <div style={styles.value}>
                  {item.name}
                  {item.isComponent && <span style={styles.componentBadge}>Component</span>}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>{item.type}</div>
              </div>
            ))}
            {state.selection.length > 5 && (
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', padding: '8px' }}>
                +{state.selection.length - 5} more
              </div>
            )}
          </div>
        ) : (
          <div style={styles.emptyState}>Select something in Figma</div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Actions</h2>
        <button style={styles.buttonSecondary} onClick={() => sendMessage('ping')}>Ping</button>
        <button style={styles.buttonSecondary} onClick={() => sendMessage('close')}>Close</button>
      </div>
    </>
  );

  const renderExtractionTab = () => (
    <>
      {/* Capabilities */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>API Capabilities</h2>
        <div style={styles.card}>
          {state.capabilities ? (
            Object.entries(state.capabilities).map(([key, value]) => (
              <div key={key} style={styles.capabilityItem}>
                <span>{key.replace(/([A-Z])/g, ' $1').replace('can ', '')}</span>
                <span style={value ? styles.capabilityCheck : styles.capabilityX}>
                  {value ? '✓' : '✗'}
                </span>
              </div>
            ))
          ) : (
            <div>Loading capabilities...</div>
          )}
        </div>
      </div>

      {/* Extract Button */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Component Extraction</h2>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
          Select a Component or ComponentSet in Figma, then click Extract to test the extraction.
        </p>
        <button
          style={{
            ...styles.button,
            ...(hasComponentSelected ? styles.buttonSuccess : {}),
            ...(!hasComponentSelected || state.isExtracting ? styles.buttonDisabled : {}),
          }}
          onClick={handleExtract}
          disabled={!hasComponentSelected || state.isExtracting}
        >
          {state.isExtracting ? 'Extracting...' : hasComponentSelected ? 'Extract Component' : 'Select a Component'}
        </button>
        {!hasComponentSelected && state.selection.length > 0 && (
          <div style={styles.warning}>
            ⚠️ Selected item is not a Component or ComponentSet
          </div>
        )}
      </div>
    </>
  );

  // Image Export Tab (Chunk 0.03)
  const renderExportTab = () => (
    <>
      {/* Export Settings */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Export Settings</h2>
        <div style={styles.card}>
          <div style={{ marginBottom: '12px' }}>
            <div style={styles.label}>Format</div>
            <select
              style={styles.select}
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as typeof exportFormat)}
            >
              <option value="auto">Auto (recommended per node type)</option>
              <option value="PNG">PNG</option>
              <option value="SVG">SVG</option>
              <option value="JPG">JPG</option>
            </select>
          </div>
          
          {exportFormat !== 'auto' && exportFormat !== 'SVG' && (
            <div>
              <div style={styles.label}>Scale</div>
              <select
                style={styles.select}
                value={exportScale}
                onChange={(e) => setExportScale(Number(e.target.value) as typeof exportScale)}
              >
                <option value={1}>1x</option>
                <option value={2}>2x (recommended)</option>
                <option value={3}>3x</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Export Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Export Selection</h2>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
          Select nodes in Figma to export as images. 
          {state.selection.length > 0 && (
            <span> ({exportableCount} of {state.selection.length} exportable)</span>
          )}
        </p>
        
        <button
          style={{
            ...styles.button,
            ...(exportableCount > 0 ? styles.buttonSuccess : {}),
            ...(exportableCount === 0 || state.imageExport.loading ? styles.buttonDisabled : {}),
          }}
          onClick={handleExport}
          disabled={exportableCount === 0 || state.imageExport.loading}
        >
          {state.imageExport.loading ? 'Exporting...' : `Export ${exportableCount} Node${exportableCount !== 1 ? 's' : ''}`}
        </button>
        
        <button
          style={{
            ...styles.buttonSecondary,
            ...(exportableCount === 0 || state.imageExport.loading ? styles.buttonDisabled : {}),
          }}
          onClick={handleBenchmark}
          disabled={exportableCount === 0 || state.imageExport.loading}
        >
          Run Benchmark
        </button>
        
        {(state.imageExport.results || state.imageExport.errors || state.imageExport.benchmarkReport) && (
          <button style={styles.buttonSecondary} onClick={clearExportResults}>
            Clear Results
          </button>
        )}
      </div>

      {/* Export Results */}
      {state.imageExport.results && state.imageExport.results.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Export Results ({state.imageExport.results.length})</h2>
          {state.imageExport.results.map((result, index) => (
            <div key={index} style={styles.exportResultCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={styles.value}>{result.nodeName}</div>
                <span style={{ ...styles.formatBadge, backgroundColor: getFormatColor(result.format), color: 'white' }}>
                  {result.format} {result.scale}x
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {result.nodeType} • {formatBytes(result.sizeBytes)} • {result.exportTimeMs}ms
              </div>
              {result.base64 && (
                <img
                  src={`data:image/${result.format.toLowerCase()};base64,${result.base64}`}
                  alt={result.nodeName}
                  style={styles.imageThumbnail}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Export Errors */}
      {state.imageExport.errors && state.imageExport.errors.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Errors ({state.imageExport.errors.length})</h2>
          {state.imageExport.errors.map((err, index) => (
            <div key={index} style={styles.exportErrorCard}>
              <div style={{ ...styles.value, color: '#F24E1E' }}>
                {err.nodeName || 'Export Error'}
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {err.error}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Benchmark Results */}
      {state.imageExport.benchmarkReport && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Benchmark Report</h2>
          <pre style={styles.benchmarkPre}>{state.imageExport.benchmarkReport}</pre>
        </div>
      )}
    </>
  );

  // API Communication Tab (Chunk 0.04)
  const renderApiTab = () => (
    <>
      {/* Endpoint Configuration */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>API Endpoint</h2>
        <div style={styles.card}>
          <div style={styles.label}>Custom Endpoint URL</div>
          <input
            type="text"
            style={styles.input}
            value={state.api.customEndpoint}
            onChange={(e) => setState(prev => ({
              ...prev,
              api: { ...prev.api, customEndpoint: e.target.value },
            }))}
            placeholder="https://your-api.com/endpoint"
          />
          <div style={{ fontSize: '11px', color: '#666' }}>
            Default: httpbin.org (echo service for testing)
          </div>
        </div>
      </div>

      {/* Connection Tests */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Connection Tests</h2>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
          Test API connectivity from the plugin. Uses message relay through UI iframe.
        </p>
        
        <button
          style={{
            ...styles.button,
            ...(state.api.testing ? styles.buttonDisabled : {}),
          }}
          onClick={handleTestConnection}
          disabled={state.api.testing}
        >
          {state.api.testing ? 'Testing...' : 'Test Custom Endpoint'}
        </button>
        
        <button
          style={{
            ...styles.buttonSecondary,
            ...(state.api.testing ? styles.buttonDisabled : {}),
          }}
          onClick={handleRunConnectionTests}
          disabled={state.api.testing}
        >
          Run Full Test Suite
        </button>

        {(state.api.testResult || state.api.connectionTests || state.api.sendResult) && (
          <button style={styles.buttonSecondary} onClick={clearApiResults}>
            Clear Results
          </button>
        )}
      </div>

      {/* Test Result */}
      {state.api.testResult && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Test Result</h2>
          <div style={{
            ...styles.apiResultCard,
            ...(state.api.testResult.success ? styles.apiSuccess : styles.apiError),
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={styles.value}>
                {state.api.testResult.success ? '✓ Connection Successful' : '✗ Connection Failed'}
              </div>
              <span style={styles.timing}>{state.api.testResult.roundTripMs}ms</span>
            </div>
            {state.api.testResult.error && (
              <div style={{ fontSize: '11px', color: '#F24E1E', marginTop: '8px' }}>
                {state.api.testResult.error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connection Tests Results */}
      {state.api.connectionTests && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Test Suite Results ({state.api.connectionTests.filter(t => t.success).length}/{state.api.connectionTests.length} passed)
          </h2>
          <div style={styles.card}>
            {state.api.connectionTests.map((test, index) => (
              <div key={index} style={styles.testItem}>
                <div>
                  <div style={styles.value}>{test.name}</div>
                  <div style={{ fontSize: '10px', color: '#666', fontFamily: 'monospace' }}>
                    {test.endpoint}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.timing}>{test.durationMs}ms</span>
                  <span style={test.success ? styles.capabilityCheck : styles.capabilityX}>
                    {test.success ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send Component Data */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Send Component Data</h2>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
          Send extracted component data to the API endpoint.
          {!hasExtractedComponent && ' Extract a component first in the Extraction tab.'}
        </p>
        
        <button
          style={{
            ...styles.button,
            ...(hasExtractedComponent ? styles.buttonSuccess : {}),
            ...(!hasExtractedComponent || state.api.testing ? styles.buttonDisabled : {}),
          }}
          onClick={handleSendExtractedComponent}
          disabled={!hasExtractedComponent || state.api.testing}
        >
          {state.api.testing ? 'Sending...' : hasExtractedComponent ? 'Send Component Data' : 'No Component Extracted'}
        </button>
      </div>

      {/* Send Result */}
      {state.api.sendResult && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Send Result</h2>
          <div style={{
            ...styles.apiResultCard,
            ...(state.api.sendResult.success ? styles.apiSuccess : styles.apiError),
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={styles.value}>
                {state.api.sendResult.success ? '✓ Data Sent Successfully' : `✗ Failed (${state.api.sendResult.status || 'Network Error'})`}
              </div>
              <span style={styles.timing}>{state.api.sendResult.timing.durationMs}ms</span>
            </div>
            {state.api.sendResult.error && (
              <div style={{ fontSize: '11px', color: '#F24E1E', marginTop: '8px' }}>
                {state.api.sendResult.error}
              </div>
            )}
            {state.api.sendResult.data && (
              <details style={{ marginTop: '8px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '11px', color: '#666' }}>
                  View Response Data
                </summary>
                <div style={{ ...styles.codeBlock, marginTop: '8px', maxHeight: '150px' }}>
                  {JSON.stringify(state.api.sendResult.data, null, 2)}
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      {/* CORS Info */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>CORS Requirements</h2>
        <div style={{ ...styles.card, backgroundColor: '#FFF8E6', border: '1px solid #FFE082' }}>
          <div style={{ fontSize: '12px', color: '#B8860B' }}>
            <strong>Note:</strong> Your API must return these headers:
          </div>
          <pre style={{ fontSize: '10px', fontFamily: 'monospace', margin: '8px 0 0 0', color: '#666' }}>
{`Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type`}
          </pre>
        </div>
      </div>
    </>
  );

  const renderResultsTab = () => (
    <>
      {state.extractionResults ? (
        state.extractionResults.map((result, index) => (
          <div
            key={index}
            style={{
              ...styles.resultCard,
              ...(result.success ? styles.resultSuccess : styles.resultError),
            }}
          >
            {result.success && result.component ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={styles.value}>{result.component.name}</div>
                  <span style={{ ...styles.componentBadge, backgroundColor: result.component.type === 'COMPONENT_SET' ? '#9747FF' : '#18A0FB' }}>
                    {result.component.type}
                  </span>
                </div>
                
                {result.component.description && (
                  <p style={{ fontSize: '12px', color: '#666', margin: '8px 0' }}>
                    {result.component.description}
                  </p>
                )}

                {/* Properties */}
                {result.component.properties.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={styles.label}>Properties ({result.component.properties.length})</div>
                    <div style={{ marginTop: '4px' }}>
                      {result.component.properties.map((prop, i) => (
                        <span key={i} style={styles.propertyTag}>
                          {prop.name}: {prop.type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variants */}
                {result.component.variants && result.component.variants.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={styles.label}>Variants ({result.component.variants.length})</div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                      {result.component.variants.slice(0, 3).map(v => v.name).join(', ')}
                      {result.component.variants.length > 3 && ` +${result.component.variants.length - 3} more`}
                    </div>
                  </div>
                )}

                {/* Bound Variables */}
                {result.component.boundVariables.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={styles.label}>Bound Variables ({result.component.boundVariables.length})</div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                      {result.component.boundVariables.slice(0, 3).map(v => v.variableName).join(', ')}
                      {result.component.boundVariables.length > 3 && ` +${result.component.boundVariables.length - 3} more`}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    {result.warnings.map((w, i) => (
                      <div key={i} style={styles.warning}>⚠️ {w}</div>
                    ))}
                  </div>
                )}

                {/* Raw JSON */}
                <details style={{ marginTop: '12px' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '11px', color: '#666' }}>
                    View Raw JSON
                  </summary>
                  <div style={{ ...styles.codeBlock, marginTop: '8px' }}>
                    {JSON.stringify(result.component, null, 2)}
                  </div>
                </details>
              </>
            ) : (
              <div>
                <div style={{ ...styles.value, color: '#F24E1E' }}>Extraction Failed</div>
                <p style={{ fontSize: '12px', color: '#666', margin: '8px 0' }}>
                  {result.error}
                </p>
              </div>
            )}
          </div>
        ))
      ) : (
        <div style={styles.emptyState}>
          No extraction results yet.<br />
          Go to the Extraction tab and select a component.
        </div>
      )}
    </>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Design System Admin</h1>
        <p style={styles.subtitle}>PoC - Component Extraction Testing</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(['status', 'extraction', 'export', 'api', 'results', 'components'] as const).map(tab => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(state.activeTab === tab ? styles.tabActive : {}),
            }}
            onClick={() => setState(prev => ({ ...prev, activeTab: tab }))}
          >
            {tab === 'api' ? 'API' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {state.activeTab === 'status' && renderStatusTab()}
      {state.activeTab === 'extraction' && renderExtractionTab()}
      {state.activeTab === 'export' && renderExportTab()}
      {state.activeTab === 'api' && renderApiTab()}
      {state.activeTab === 'results' && renderResultsTab()}
      {state.activeTab === 'components' && <ComponentsTab />}
    </div>
  );
}

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
