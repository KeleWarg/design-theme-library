/**
 * @chunk B.6 - IconPicker Component
 * 
 * Dropdown/popover component for selecting icons from the icon library.
 * Used in PropControl for icon-type props.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, X, Search, Image } from 'lucide-react';
import { useIcons } from '../../hooks/useIcons';

export default function IconPicker({ 
  label, 
  value, 
  onChange, 
  required = false,
  placeholder = 'Select icon...',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const { data: icons, isLoading } = useIcons(
    search.trim() ? { search: search.trim() } : {}
  );

  // Find selected icon
  const selectedIcon = useMemo(() => {
    if (!value || !icons) return null;
    return icons.find(i => i.slug === value || i.id === value);
  }, [value, icons]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (icon) => {
    onChange?.(icon.slug);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearch('');
    }
  };

  return (
    <div className={`icon-picker ${className}`} ref={containerRef}>
      {label && (
        <label className="icon-picker-label">
          {label}
          {required && <span className="icon-picker-required">*</span>}
        </label>
      )}

      <button
        type="button"
        className={`icon-picker-trigger ${isOpen ? 'icon-picker-trigger--open' : ''}`}
        onClick={handleToggle}
      >
        <div className="icon-picker-value">
          {selectedIcon ? (
            <>
              <div 
                className="icon-picker-preview"
                dangerouslySetInnerHTML={{ __html: selectedIcon.svg_text || '' }}
              />
              <span className="icon-picker-name">{selectedIcon.name}</span>
            </>
          ) : (
            <span className="icon-picker-placeholder">{placeholder}</span>
          )}
        </div>

        <div className="icon-picker-actions">
          {selectedIcon && (
            <span 
              className="icon-picker-clear"
              onClick={handleClear}
              role="button"
              tabIndex={0}
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown 
            size={16} 
            className={`icon-picker-chevron ${isOpen ? 'icon-picker-chevron--open' : ''}`} 
          />
        </div>
      </button>

      {isOpen && (
        <div className="icon-picker-dropdown">
          <div className="icon-picker-search">
            <Search size={16} className="icon-picker-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons..."
              className="icon-picker-search-input"
            />
          </div>

          <div className="icon-picker-list">
            {isLoading ? (
              <div className="icon-picker-loading">Loading icons...</div>
            ) : !icons || icons.length === 0 ? (
              <div className="icon-picker-empty">
                <Image size={24} />
                <span>
                  {search ? 'No icons found' : 'No icons in library'}
                </span>
              </div>
            ) : (
              icons.map(icon => (
                <button
                  key={icon.id}
                  type="button"
                  className={`icon-picker-option ${value === icon.slug ? 'icon-picker-option--selected' : ''}`}
                  onClick={() => handleSelect(icon)}
                >
                  <div 
                    className="icon-picker-option-preview"
                    dangerouslySetInnerHTML={{ __html: icon.svg_text || '' }}
                  />
                  <span className="icon-picker-option-name">{icon.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .icon-picker {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs, 4px);
        }

        .icon-picker-label {
          font-size: var(--font-size-sm, 14px);
          font-weight: var(--font-weight-medium, 500);
          color: var(--color-foreground, #1a1a1a);
        }

        .icon-picker-required {
          color: var(--color-error, #ef4444);
          margin-left: var(--spacing-xs, 4px);
        }

        .icon-picker-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-sm, 8px);
          width: 100%;
          padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
          background: var(--color-background, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 6px);
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }

        .icon-picker-trigger:hover {
          border-color: var(--color-primary, #3b82f6);
        }

        .icon-picker-trigger--open {
          border-color: var(--color-primary, #3b82f6);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .icon-picker-value {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 8px);
          flex: 1;
          min-width: 0;
        }

        .icon-picker-preview {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: var(--color-foreground, #1a1a1a);
        }

        .icon-picker-preview svg {
          width: 100%;
          height: 100%;
        }

        .icon-picker-name {
          font-size: var(--font-size-sm, 14px);
          color: var(--color-foreground, #1a1a1a);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .icon-picker-placeholder {
          font-size: var(--font-size-sm, 14px);
          color: var(--color-muted-foreground, #6b7280);
        }

        .icon-picker-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs, 4px);
        }

        .icon-picker-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: var(--radius-sm, 4px);
          color: var(--color-muted-foreground, #6b7280);
          transition: all 0.15s;
        }

        .icon-picker-clear:hover {
          background: var(--color-muted, #f3f4f6);
          color: var(--color-foreground, #1a1a1a);
        }

        .icon-picker-chevron {
          color: var(--color-muted-foreground, #6b7280);
          transition: transform 0.15s;
        }

        .icon-picker-chevron--open {
          transform: rotate(180deg);
        }

        .icon-picker-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: var(--spacing-xs, 4px);
          background: var(--color-background, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 6px);
          box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
          z-index: 50;
          overflow: hidden;
        }

        .icon-picker-search {
          position: relative;
          padding: var(--spacing-sm, 8px);
          border-bottom: 1px solid var(--color-border, #e5e7eb);
        }

        .icon-picker-search-icon {
          position: absolute;
          left: calc(var(--spacing-sm, 8px) + var(--spacing-sm, 8px));
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-muted-foreground, #6b7280);
          pointer-events: none;
        }

        .icon-picker-search-input {
          width: 100%;
          padding: var(--spacing-sm, 8px);
          padding-left: calc(var(--spacing-sm, 8px) + 16px + var(--spacing-sm, 8px));
          background: var(--color-muted, #f3f4f6);
          border: none;
          border-radius: var(--radius-sm, 4px);
          font-size: var(--font-size-sm, 14px);
          color: var(--color-foreground, #1a1a1a);
          outline: none;
        }

        .icon-picker-search-input::placeholder {
          color: var(--color-muted-foreground, #6b7280);
        }

        .icon-picker-list {
          max-height: 240px;
          overflow-y: auto;
          padding: var(--spacing-xs, 4px);
        }

        .icon-picker-loading,
        .icon-picker-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm, 8px);
          padding: var(--spacing-lg, 24px);
          color: var(--color-muted-foreground, #6b7280);
          font-size: var(--font-size-sm, 14px);
        }

        .icon-picker-option {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 8px);
          width: 100%;
          padding: var(--spacing-sm, 8px);
          background: transparent;
          border: none;
          border-radius: var(--radius-sm, 4px);
          cursor: pointer;
          transition: background 0.15s;
          text-align: left;
        }

        .icon-picker-option:hover {
          background: var(--color-muted, #f3f4f6);
        }

        .icon-picker-option--selected {
          background: var(--color-primary-light, #eff6ff);
        }

        .icon-picker-option-preview {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: var(--color-foreground, #1a1a1a);
        }

        .icon-picker-option-preview svg {
          width: 100%;
          height: 100%;
        }

        .icon-picker-option-name {
          font-size: var(--font-size-sm, 14px);
          color: var(--color-foreground, #1a1a1a);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}

