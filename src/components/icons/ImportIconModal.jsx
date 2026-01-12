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
  const [mode, setMode] = useState('url'); // 'url' (icons8 is coming soon)
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [style, setStyle] = useState('outline');
  const [isImporting, setIsImporting] = useState(false);

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
    setMode('url');
    onClose?.();
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
            className="import-tab import-tab--disabled"
            disabled
            aria-disabled="true"
            title="Coming soon"
          >
            <ExternalLink size={16} />
            Icons8 (Coming Soon)
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

        {/* Icons8 Notice (Coming Soon) */}
        <div className="import-icons8-notice">
          <AlertCircle size={20} />
          <div>
            <strong>Icons8 integration is coming soon</strong>
            <p>
              For now, import Icons8 SVGs by copying an SVG URL (or downloading an SVG) and using
              <strong> From URL</strong>.
            </p>
          </div>
        </div>
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

        .import-tab--disabled {
          opacity: 0.55;
          cursor: not-allowed;
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

      `}</style>
    </Modal>
  );
}

