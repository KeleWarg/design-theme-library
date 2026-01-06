/**
 * @chunk 5.01 - ExportModal Shell
 * 
 * Main export modal with format selection
 */

import { useState } from 'react';
import { Modal, Button } from '../ui';
import ThemeSelector from './ThemeSelector';
import ComponentSelector from './ComponentSelector';
import FormatTabs from './FormatTabs';
import TokenFormatOptions from './TokenFormatOptions';
import AIFormatOptions from './AIFormatOptions';
import MCPServerOptions from './MCPServerOptions';
import FullPackageOptions from './FullPackageOptions';
import ExportPreview from './ExportPreview';
import ExportResultDialog from './ExportResultDialog';
import { exportService } from '../../services/exportService';
import { toast } from 'sonner';

export default function ExportModal({ open, onClose }) {
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [activeFormat, setActiveFormat] = useState('tokens');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const result = await exportService.buildPackage({
        themes: selectedThemes,
        components: selectedComponents,
        formats: getFormatsForTab(activeFormat)
      });
      
      setExportResult(result);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} size="large" title="Export Design System">
        <div className="export-modal">
          <div className="export-sidebar">
            <ThemeSelector
              selected={selectedThemes}
              onChange={setSelectedThemes}
            />
            <ComponentSelector
              selected={selectedComponents}
              onChange={setSelectedComponents}
            />
          </div>

          <div className="export-main">
            <FormatTabs
              activeFormat={activeFormat}
              onChange={setActiveFormat}
            />

            <div className="format-content">
              {activeFormat === 'tokens' && <TokenFormatOptions />}
              {activeFormat === 'ai' && <AIFormatOptions />}
              {activeFormat === 'mcp' && <MCPServerOptions />}
              {activeFormat === 'full' && <FullPackageOptions />}
            </div>

            <div className="export-preview">
              <ExportPreview
                themes={selectedThemes}
                components={selectedComponents}
                format={activeFormat}
              />
            </div>
          </div>

          <div className="export-footer">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleExport} 
              loading={isExporting}
              disabled={selectedThemes.length === 0 && selectedComponents.length === 0}
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>

      {exportResult && (
        <ExportResultDialog
          result={exportResult}
          onClose={() => setExportResult(null)}
        />
      )}
    </>
  );
}

function getFormatsForTab(tab) {
  const mapping = {
    tokens: ['css', 'json', 'tailwind', 'scss'],
    ai: ['cursor', 'claude', 'project-knowledge'],
    mcp: ['mcp'],
    full: ['all'],
  };
  return mapping[tab] || ['all'];
}

