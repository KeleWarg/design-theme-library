/**
 * @chunk B.4 - IconCard Component
 * 
 * Card component for displaying an icon in the library grid.
 */

import { useState } from 'react';
import { Trash2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function IconCard({ icon, onDelete, onSelect, selected = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopyName = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(icon.slug);
      setCopied(true);
      toast.success('Icon name copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Delete icon "${icon.name}"?`)) {
      onDelete?.(icon.id);
    }
  };

  const handleClick = () => {
    onSelect?.(icon);
  };

  return (
    <div 
      className={`icon-card ${selected ? 'icon-card--selected' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="icon-card-preview">
        {icon.svg_text ? (
          <div 
            className="icon-card-svg"
            dangerouslySetInnerHTML={{ __html: icon.svg_text }}
          />
        ) : (
          <div className="icon-card-placeholder">?</div>
        )}
      </div>

      <div className="icon-card-info">
        <span className="icon-card-name" title={icon.name}>
          {icon.name}
        </span>
        <span className="icon-card-style">{icon.style}</span>
      </div>

      <div className="icon-card-actions">
        <button
          type="button"
          className="icon-card-action"
          onClick={handleCopyName}
          title="Copy name"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <button
          type="button"
          className="icon-card-action icon-card-action--danger"
          onClick={handleDelete}
          title="Delete icon"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <style>{`
        .icon-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--spacing-md, 16px);
          background: var(--color-background, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-lg, 8px);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .icon-card:hover {
          border-color: var(--color-primary, #3b82f6);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .icon-card--selected {
          border-color: var(--color-primary, #3b82f6);
          background: var(--color-primary-light, #eff6ff);
        }

        .icon-card-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          margin-bottom: var(--spacing-sm, 8px);
          color: var(--color-foreground, #1a1a1a);
        }

        .icon-card-svg {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-card-svg svg {
          width: 32px;
          height: 32px;
        }

        .icon-card-placeholder {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-muted, #f3f4f6);
          border-radius: var(--radius-sm, 4px);
          color: var(--color-muted-foreground, #6b7280);
          font-size: var(--font-size-lg, 18px);
        }

        .icon-card-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs, 4px);
          width: 100%;
          text-align: center;
        }

        .icon-card-name {
          font-size: var(--font-size-sm, 14px);
          font-weight: var(--font-weight-medium, 500);
          color: var(--color-foreground, #1a1a1a);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .icon-card-style {
          font-size: var(--font-size-xs, 12px);
          color: var(--color-muted-foreground, #6b7280);
          text-transform: capitalize;
        }

        .icon-card-actions {
          position: absolute;
          top: var(--spacing-xs, 4px);
          right: var(--spacing-xs, 4px);
          display: flex;
          gap: var(--spacing-xs, 4px);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .icon-card:hover .icon-card-actions {
          opacity: 1;
        }

        .icon-card-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 0;
          background: var(--color-background, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-sm, 4px);
          color: var(--color-muted-foreground, #6b7280);
          cursor: pointer;
          transition: all 0.15s;
        }

        .icon-card-action:hover {
          background: var(--color-muted, #f3f4f6);
          color: var(--color-foreground, #1a1a1a);
        }

        .icon-card-action--danger:hover {
          background: var(--color-error-light, #fee2e2);
          border-color: var(--color-error, #ef4444);
          color: var(--color-error, #ef4444);
        }
      `}</style>
    </div>
  );
}

