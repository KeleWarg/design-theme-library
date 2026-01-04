/**
 * @chunk 4.06 - ManualImportModal
 * 
 * Modal for manually importing component JSON without the Figma plugin.
 * Supports pasting JSON or loading example data.
 */

import { useState, useRef } from 'react';
import { Upload, FileJson, Info, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function ManualImportModal({ open, onClose, onSuccess }) {
  const [jsonInput, setJsonInput] = useState('');
  const [fileName, setFileName] = useState('Manual Import');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsePreview, setParsePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Validate and preview JSON
  const handleJsonChange = (value) => {
    setJsonInput(value);
    setError(null);
    setParsePreview(null);

    if (!value.trim()) return;

    try {
      const data = JSON.parse(value);
      const components = Array.isArray(data) ? data : [data];
      setParsePreview({
        count: components.length,
        names: components.slice(0, 5).map(c => c.name || 'Unnamed'),
        hasMore: components.length > 5
      });
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        handleJsonChange(content);
        setFileName(file.name.replace(/\.json$/, ''));
      }
    };
    reader.readAsText(file);
  };

  // Import components
  const handleImport = async () => {
    setLoading(true);
    setError(null);

    try {
      // Parse JSON
      const data = JSON.parse(jsonInput);
      const components = Array.isArray(data) ? data : [data];

      if (components.length === 0) {
        throw new Error('No components found in JSON');
      }

      // Create import record using RPC or direct insert
      let importRecord;
      try {
        const { data: rpcResult, error: rpcError } = await supabase
          .rpc('get_figma_imports');
        
        // If RPC works, schema cache is fine - use direct insert
        const { data: insertedImport, error: insertError } = await supabase
          .from('figma_imports')
          .insert({
            file_name: fileName || 'Manual Import',
            file_key: 'manual-' + Date.now(),
            status: 'pending',
            component_count: components.length,
            imported_count: 0,
            metadata: {
              source: 'manual',
              importedAt: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (insertError) throw insertError;
        importRecord = insertedImport;
      } catch (schemaError) {
        // Handle schema cache error gracefully
        if (schemaError.message?.includes('schema cache')) {
          throw new Error('Database tables are initializing. Please wait a minute and try again.');
        }
        throw schemaError;
      }

      // Create component records
      const componentRecords = components.map((comp, index) => ({
        import_id: importRecord.id,
        figma_id: comp.figma_id || comp.id || `manual-${Date.now()}-${index}`,
        name: comp.name || `Component ${index + 1}`,
        description: comp.description || '',
        component_type: comp.type || comp.component_type || 'component',
        properties: comp.properties || comp.props || {},
        variants: Array.isArray(comp.variants) ? comp.variants : [],
        bound_variables: comp.bound_variables || comp.tokens || [],
        structure: comp.structure || comp.figma_data || {},
        status: 'pending',
      }));

      const { error: compError } = await supabase
        .from('figma_import_components')
        .insert(componentRecords);

      if (compError) throw compError;

      // Success
      toast.success(`Imported ${components.length} component${components.length > 1 ? 's' : ''}`);
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import. Check JSON format.');
    } finally {
      setLoading(false);
    }
  };

  // Reset and close
  const handleClose = () => {
    setJsonInput('');
    setFileName('Manual Import');
    setError(null);
    setParsePreview(null);
    onClose();
  };

  // Sample JSON for reference
  const sampleJson = JSON.stringify({
    name: "MyButton",
    description: "A custom button component",
    type: "component",
    properties: {
      variant: { type: "enum", options: ["primary", "secondary", "outline"] },
      size: { type: "enum", options: ["sm", "md", "lg"] },
      children: { type: "string", default: "Click me" },
      disabled: { type: "boolean", default: false }
    },
    variants: [
      { name: "Primary", props: { variant: "primary" } },
      { name: "Secondary", props: { variant: "secondary" } },
      { name: "Outline", props: { variant: "outline" } }
    ],
    bound_variables: [
      { variableName: "Color/Primary/500", property: "backgroundColor" },
      { variableName: "Color/Primary/600", property: "backgroundColor:hover" },
      { variableName: "Spacing/md", property: "padding" }
    ],
    structure: {
      type: "FRAME",
      name: "Button",
      layoutMode: "HORIZONTAL",
      children: [
        { type: "TEXT", name: "Label", characters: "Click me" }
      ]
    }
  }, null, 2);

  return (
    <Modal open={open} onClose={handleClose} title="Import Component JSON" size="large">
      <div className="manual-import-modal">
        {/* File name input */}
        <div className="import-field">
          <label className="import-label">Import Name</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="import-input"
            placeholder="My Component Import"
          />
        </div>

        {/* JSON input */}
        <div className="import-field">
          <div className="import-label-row">
            <label className="import-label">Component JSON</label>
            <div className="import-label-actions">
              <button
                type="button"
                className="import-text-btn"
                onClick={() => handleJsonChange(sampleJson)}
              >
                Load example
              </button>
              <span className="import-divider">|</span>
              <button
                type="button"
                className="import-text-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => handleJsonChange(e.target.value)}
            className="import-textarea"
            placeholder="Paste component JSON here, or click 'Load example' to see the format..."
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        {parsePreview && !error && (
          <div className="import-preview">
            <CheckCircle size={16} className="preview-icon success" />
            <span>
              Found {parsePreview.count} component{parsePreview.count > 1 ? 's' : ''}
              {parsePreview.count > 0 && (
                <span className="preview-names">
                  : {parsePreview.names.join(', ')}
                  {parsePreview.hasMore && '...'}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="import-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Help text */}
        <div className="import-help">
          <Info size={14} />
          <p>
            Paste JSON matching the Figma plugin export format. You can import a single 
            component object or an array of components. Click "Load example" to see the structure.
          </p>
        </div>

        {/* Actions */}
        <div className="import-actions">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!jsonInput.trim() || !!error || loading}
            loading={loading}
          >
            <Upload size={16} />
            {loading ? 'Importing...' : `Import${parsePreview ? ` ${parsePreview.count} Component${parsePreview.count > 1 ? 's' : ''}` : ''}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

