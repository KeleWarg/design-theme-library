import React, { useState, useRef, useEffect } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  /** Array of accordion items */
  items: AccordionItem[];
  /** Whether multiple sections can be expanded at once */
  allowMultiple?: boolean;
  /** Initially expanded item IDs */
  defaultExpanded?: string[];
  /** Callback when expansion state changes */
  onExpandedChange?: (expandedIds: string[]) => void;
  /** Custom class name */
  className?: string;
  /** Whether to show dividers between items */
  showDividers?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultExpanded = [],
  onExpandedChange,
  className = '',
  showDividers = true,
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpanded);
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const toggleItem = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item?.disabled) return;

    let newExpandedIds: string[];
    
    if (allowMultiple) {
      newExpandedIds = expandedIds.includes(id)
        ? expandedIds.filter(expandedId => expandedId !== id)
        : [...expandedIds, id];
    } else {
      newExpandedIds = expandedIds.includes(id) ? [] : [id];
    }

    setExpandedIds(newExpandedIds);
    onExpandedChange?.(newExpandedIds);
  };

  const handleKeyDown = (event: React.KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleItem(id);
    }
  };

  const accordionStyles: React.CSSProperties = {
    border: `1px solid var(--color-border-default)`,
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-bg-default)',
    overflow: 'hidden',
  };

  const itemStyles: React.CSSProperties = {
    borderBottom: showDividers ? `1px solid var(--color-border-subtle)` : 'none',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-4) var(--space-5)',
    backgroundColor: 'var(--color-bg-default)',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-primary)',
    transition: 'var(--transition-normal)',
    fontFamily: 'var(--font-family-sans)',
  };

  const headerHoverStyles: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-subtle)',
  };

  const headerDisabledStyles: React.CSSProperties = {
    cursor: 'not-allowed',
    color: 'var(--color-text-disabled)',
    backgroundColor: 'var(--color-bg-default)',
  };

  const chevronStyles: React.CSSProperties = {
    width: '20px',
    height: '20px',
    transition: 'var(--transition-normal)',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
    marginLeft: 'var(--space-2)',
  };

  const contentWrapperStyles: React.CSSProperties = {
    overflow: 'hidden',
    transition: 'var(--transition-normal)',
  };

  const contentStyles: React.CSSProperties = {
    padding: 'var(--space-4) var(--space-5)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--font-size-sm)',
    lineHeight: 'var(--line-height-normal)',
    fontFamily: 'var(--font-family-sans)',
  };

  const ChevronIcon: React.FC<{ expanded: boolean; disabled?: boolean }> = ({ expanded, disabled }) => (
    <svg
      style={{
        ...chevronStyles,
        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)',
      }}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div style={accordionStyles} className={className} role="region">
      {items.map((item, index) => {
        const isExpanded = expandedIds.includes(item.id);
        const isLastItem = index === items.length - 1;
        
        return (
          <div
            key={item.id}
            style={{
              ...itemStyles,
              borderBottom: isLastItem ? 'none' : itemStyles.borderBottom,
            }}
          >
            <button
              style={headerStyles}
              onClick={() => toggleItem(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              onMouseEnter={(e) => {
                if (!item.disabled) {
                  Object.assign(e.currentTarget.style, headerHoverStyles);
                }
              }}
              onMouseLeave={(e) => {
                if (!item.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-default)';
                }
              }}
              disabled={item.disabled}
              aria-expanded={isExpanded}
              aria-controls={`accordion-content-${item.id}`}
              id={`accordion-header-${item.id}`}
              type="button"
              {...(item.disabled && { style: { ...headerStyles, ...headerDisabledStyles } })}
            >
              <span>{item.title}</span>
              <ChevronIcon expanded={isExpanded} disabled={item.disabled} />
            </button>
            
            <div
              ref={(el) => (contentRefs.current[item.id] = el)}
              style={{
                ...contentWrapperStyles,
                height: isExpanded ? 'auto' : '0',
                opacity: isExpanded ? 1 : 0,
              }}
              id={`accordion-content-${item.id}`}
              role="region"
              aria-labelledby={`accordion-header-${item.id}`}
            >
              {isExpanded && (
                <div style={contentStyles}>
                  {item.content}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;