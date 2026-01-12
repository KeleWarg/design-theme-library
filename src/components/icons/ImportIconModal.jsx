/**
 * @chunk B.5 - ImportIconModal Component
 * 
 * Modal for importing icons from external sources (URLs, Icons8, etc.).
 * 
 * Note: Direct Icons8 MCP integration requires Cursor tooling.
 * This component supports manual URL import and could be extended
 * to receive icons via MCP through a local API endpoint.
 */

import { useState } from 'react';
import { Download, Link as LinkIcon, ExternalLink, AlertCircle } from 'lucide-react';
import { Modal, Input, Button } from '../ui';
import { toast } from 'sonner';
import { iconService } from '../../services/iconService';

export default function ImportIconModal({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState('url'); // 'url' | 'icons8'
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [style, setStyle] = useState('outline');
  const [isImporting, setIsImporting] = useState(false);

  // Icons8 search state (for future MCP integration)
  const [icons8Query, setIcons8Query] = useState('');
  const [icons8Results, setIcons8Results] = useState([]);
  const [icons8Loading, setIcons8Loading] = useState(false);

  const handleImportFromUrl = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error('Please enter an SVG URL');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter an icon name');
      return;
    }

    setIsImporting(true);

    try {
      const tagArray = tags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);

      // Determine source from URL
      let source = 'custom';
      if (url.includes('icons8')) source = 'icons8';
      else if (url.includes('lucide')) source = 'lucide';
      else if (url.includes('heroicons')) source = 'heroicons';
      else if (url.includes('fontawesome')) source = 'fontawesome';

      await iconService.importFromUrl(url.trim(), {
        name: name.trim(),
        style,
        source,
        tags: tagArray
      });

      toast.success('Icon imported successfully');
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error('Failed to import icon:', err);
      toast.error(err.message || 'Failed to import icon');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setName('');
    setTags('');
    setStyle('outline');
    setIcons8Query('');
    setIcons8Results([]);
    setMode('url');
    onClose?.();
  };

  // Placeholder for Icons8 MCP search
  // In practice, this would call an MCP tool through Cursor
  const handleIcons8Search = async () => {
    if (!icons8Query.trim()) return;
    
    setIcons8Loading(true);
    
    // Simulate search - in real implementation this would call MCP
    setTimeout(() => {
      setIcons8Results([]);
      setIcons8Loading(false);
      toast.info('Icons8 MCP integration requires Cursor tooling. Use URL import for now.');
    }, 500);
  };

  const handleSelectIcons8Icon = async (icon) => {
    // This would be called when user selects an icon from Icons8 results
    // For now it's a placeholder
    try {
      await iconService.importFromIcons8({
        name: icon.name,
        svgUrl: icon.svgUrl,
        style: icon.style || 'outline',
        tags: icon.tags || []
      });
      
      toast.success('Icon imported from Icons8');
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error('Failed to import from Icons8:', err);
      toast.error(err.message || 'Failed to import icon');
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Import Icon">
      <div className="import-icon-modal">
        {/* Mode Tabs */}
        <div className="import-tabs">
          <button
            type="button"
            className={`import-tab ${mode === 'url' ? 'import-tab--active' : ''}`}
            onClick={() => setMode('url')}
          >
            <LinkIcon size={16} />
            From URL
          </button>
          <button
            type="button"
            className={`import-tab ${mode === 'icons8' ? 'import-tab--active' : ''}`}
            onClick={() => setMode('icons8')}
          >
            <ExternalLink size={16} />
            Icons8
          </button>
        </div>

        {/* URL Import Mode */}
        {mode === 'url' && (
          <form onSubmit={handleImportFromUrl} className="import-form">
            <Input
              label="SVG URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/icon.svg"
              required
            />

            <Input
              label="Icon Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arrow Right"
              required
            />

            <div className="form-field">
              <label className="form-label">Style</label>
              <div className="import-style-options">
                {['outline', 'filled', 'duotone', 'color'].map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`import-style-option ${style === s ? 'import-style-option--selected' : ''}`}
                    onClick={() => setStyle(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="arrow, navigation, ui (comma-separated)"
            />

            <div className="import-actions">
              <Button variant="secondary" onClick={handleClose} disabled={isImporting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isImporting}>
                <Download size={16} />
                Import Icon
              </Button>
            </div>
          </form>
        )}

        {/* Icons8 Mode */}
        {mode === 'icons8' && (
          <div className="import-icons8">
            <div className="import-icons8-notice">
              <AlertCircle size={20} />
              <div>
                <strong>Icons8 MCP Integration</strong>
                <p>
                  Icons8 search requires the MCP server to be running via Cursor tooling.
                  For now, you can copy an SVG URL from Icons8 and use the URL import.
                </p>
              </div>
            </div>

            <div className="import-icons8-search">
              <Input
                label="Search Icons8"
                value={icons8Query}
                onChange={(e) => setIcons8Query(e.target.value)}
                placeholder="e.g. arrow, home, settings"
              />
              <Button 
                variant="secondary" 
                onClick={handleIcons8Search}
                loading={icons8Loading}
                disabled
              >
                Search (Coming Soon)
              </Button>
            </div>

            {icons8Results.length > 0 && (
              <div className="import-icons8-results">
                {icons8Results.map(icon => (
                  <button
                    key={icon.id}
                    className="import-icons8-result"
                    onClick={() => handleSelectIcons8Icon(icon)}
                  >
                    <img src={icon.previewUrl} alt={icon.name} />
                    <span>{icon.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="import-icons8-help">
              <h4>How to import from Icons8:</h4>
              <ol>
                <li>Go to <a href="https://icons8.com" target="_blank" rel="noopener noreferrer">icons8.com</a></li>
                <li>Find an icon you want</li>
                <li>Right-click → "Copy SVG" or download as SVG</li>
                <li>Switch to "From URL" tab and paste the URL, or upload the file</li>
              </ol>
            </div>

            <div className="import-actions">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .import-icon-modal {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg, 24px);
        }

        .import-tabs {
          display: flex;
          gap: var(--spacing-xs, 4px);
          padding: var(--spacing-xs, 4px);
          background: var(--color-muted, #f3f4f6);
          border-radius: var(--radius-md, 6px);
        }

        .import-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm, 8px);
          padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
          background: transparent;
          border: none;
          border-radius: var(--radius-sm, 4px);
          font-size: var(--font-size-sm, 14px);
          color: var(--color-muted-foreground, #6b7280);
          cursor: pointer;
          transition: all 0.15s;
        }

        .import-tab:hover {
          color: var(--color-foreground, #1a1a1a);
        }

        .import-tab--active {
          background: var(--color-background, #ffffff);
          color: var(--color-foreground, #1a1a1a);
          box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
        }

        .import-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg, 24px);
        }

        .import-style-options {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs, 4px);
        }

        .import-style-option {
          padding: var(--spacing-xs, 4px) var(--spacing-md, 16px);
          background: var(--color-background, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 6px);
          font-size: var(--font-size-sm, 14px);
          color: var(--color-muted-foreground, #6b7280);
          cursor: pointer;
          text-transform: capitalize;
          transition: all 0.15s;
        }

        .import-style-option:hover {
          border-color: var(--color-primary, #3b82f6);
          color: var(--color-foreground, #1a1a1a);
        }

        .import-style-option--selected {
          background: var(--color-primary, #3b82f6);
          border-color: var(--color-primary, #3b82f6);
          color: var(--color-primary-foreground, #ffffff);
        }

        .import-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-sm, 8px);
          padding-top: var(--spacing-md, 16px);
          border-top: 1px solid var(--color-border, #e5e7eb);
        }

        .import-icons8 {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg, 24px);
        }

        .import-icons8-notice {
          display: flex;
          gap: var(--spacing-md, 16px);
          padding: var(--spacing-md, 16px);
          background: var(--color-warning-light, #fef3c7);
          border: 1px solid var(--color-warning, #f59e0b);
          border-radius: var(--radius-md, 6px);
          color: var(--color-warning-foreground, #92400e);
        }

        .import-icons8-notice strong {
          display: block;
          margin-bottom: var(--spacing-xs, 4px);
        }

        .import-icons8-notice p {
          margin: 0;
          font-size: var(--font-size-sm, 14px);
        }

        .import-icons8-search {
          display: flex;
          gap: var(--spacing-sm, 8px);
          align-items: flex-end;
        }

        .import-icons8-search .form-field {
          flex: 1;
        }

        .import-icons8-results {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: var(--spacing-sm, 8px);
          max-height: 200px;
          overflow-y: auto;
        }

        .import-icons8-result {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs, 4px);
          padding: var(--spacing-sm, 8px);
          background: var(--color-background, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 6px);
          cursor: pointer;
          transition: all 0.15s;
        }

        .import-icons8-result:hover {
          border-color: var(--color-primary, #3b82f6);
        }

        .import-icons8-result img {
          width: 32px;
          height: 32px;
        }

        .import-icons8-result span {
          font-size: var(--font-size-xs, 12px);
          color: var(--color-muted-foreground, #6b7280);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .import-icons8-help {
          padding: var(--spacing-md, 16px);
          background: var(--color-muted, #f3f4f6);
          border-radius: var(--radius-md, 6px);
        }

        .import-icons8-help h4 {
          margin: 0 0 var(--spacing-sm, 8px) 0;
          font-size: var(--font-size-sm, 14px);
          font-weight: var(--font-weight-semibold, 600);
          color: var(--color-foreground, #1a1a1a);
        }

        .import-icons8-help ol {
          margin: 0;
          padding-left: var(--spacing-lg, 24px);
          font-size: var(--font-size-sm, 14px);
          color: var(--color-muted-foreground, #6b7280);
        }

        .import-icons8-help li {
          margin-bottom: var(--spacing-xs, 4px);
        }

        .import-icons8-help a {
          color: var(--color-primary, #3b82f6);
        }
      `}</style>
    </Modal>
  );
}

