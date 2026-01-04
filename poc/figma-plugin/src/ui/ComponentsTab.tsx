/**
 * @chunk 4.01 - Plugin UI - Components Tab
 * 
 * ComponentsTab - Main components export tab UI
 */

import { useState, useEffect } from 'react';
import ComponentListItem from './ComponentListItem';

interface ComponentInfo {
  id: string;
  name: string;
  type: string;
  variantCount: number;
}

export default function ComponentsTab() {
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [components, setComponents] = useState<ComponentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [exportProgress, setExportProgress] = useState(0);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, data } = event.data.pluginMessage || {};
      
      if (type === 'components-scanned') {
        setComponents(data.components || []);
        setIsLoading(false);
      }
      if (type === 'export-progress') {
        setExportProgress(data.progress || 0);
      }
      if (type === 'export-complete') {
        setExportProgress(0);
        // Reset selection after export
        setSelectedComponents([]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleScan = () => {
    setIsLoading(true);
    setComponents([]);
    setSelectedComponents([]);
    parent.postMessage({ pluginMessage: { type: 'scan-components' } }, '*');
  };

  const handleExport = () => {
    if (selectedComponents.length === 0 || !apiUrl) return;
    
    parent.postMessage({
      pluginMessage: {
        type: 'export-components',
        componentIds: selectedComponents,
        apiUrl
      }
    }, '*');
  };

  const toggleComponent = (id: string) => {
    setSelectedComponents(prev => 
      prev.includes(id) 
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedComponents.length === components.length) {
      setSelectedComponents([]);
    } else {
      setSelectedComponents(components.map(c => c.id));
    }
  };

  return (
    <div style={styles.tabContainer}>
      <div style={styles.tabHeader}>
        <h2 style={styles.title}>Export Components</h2>
        <button 
          onClick={handleScan} 
          disabled={isLoading}
          style={{
            ...styles.button,
            ...(isLoading ? styles.buttonDisabled : {}),
          }}
        >
          {isLoading ? 'Scanning...' : 'Scan Document'}
        </button>
      </div>

      <div style={styles.apiConfig}>
        <label style={styles.label}>Admin Tool URL</label>
        <input
          type="url"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="https://your-admin-tool.com"
          style={styles.input}
        />
      </div>

      <div style={styles.componentList}>
        {components.length === 0 ? (
          <div style={styles.emptyState}>
            Click "Scan Document" to find components
          </div>
        ) : (
          <>
            <div style={styles.listHeader}>
              <label style={styles.selectAllLabel}>
                <input 
                  type="checkbox" 
                  checked={selectedComponents.length === components.length && components.length > 0}
                  onChange={toggleAll}
                  style={styles.checkbox}
                />
                Select All ({components.length})
              </label>
            </div>
            {components.map(comp => (
              <ComponentListItem
                key={comp.id}
                component={comp}
                selected={selectedComponents.includes(comp.id)}
                onToggle={() => toggleComponent(comp.id)}
              />
            ))}
          </>
        )}
      </div>

      {exportProgress > 0 && (
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${exportProgress}%` }} />
        </div>
      )}

      <div style={styles.tabFooter}>
        <span style={styles.selectionCount}>
          {selectedComponents.length} selected
        </span>
        <button 
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            ...(selectedComponents.length === 0 || !apiUrl ? styles.buttonDisabled : {}),
          }}
          onClick={handleExport}
          disabled={selectedComponents.length === 0 || !apiUrl}
        >
          Export Selected
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tabContainer: {
    padding: '16px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e5e5',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#333',
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
  },
  buttonPrimary: {
    backgroundColor: '#1BC47D',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  apiConfig: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    color: '#666',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '12px',
    fontFamily: 'monospace',
    boxSizing: 'border-box' as const,
  },
  componentList: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '16px',
  },
  emptyState: {
    padding: '24px',
    textAlign: 'center' as const,
    color: '#666',
    backgroundColor: '#fafafa',
    borderRadius: '6px',
    border: '1px dashed #ddd',
  },
  listHeader: {
    padding: '8px 12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  selectAllLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    color: '#333',
  },
  checkbox: {
    marginRight: '8px',
    cursor: 'pointer',
  },
  progressBar: {
    height: '4px',
    backgroundColor: '#e5e5e5',
    borderRadius: '2px',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#18A0FB',
    transition: 'width 0.3s ease',
  },
  tabFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #e5e5e5',
  },
  selectionCount: {
    fontSize: '12px',
    color: '#666',
    fontWeight: 500,
  },
};

