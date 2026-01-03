import React, { useState, useRef, useEffect, ReactNode } from 'react';

export interface TabItem {
  /** Unique identifier for the tab */
  id: string;
  /** Label text displayed on the tab button */
  label: string;
  /** Content to display when tab is active */
  content: ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
}

export interface TabsProps {
  /** Array of tab items */
  items: TabItem[];
  /** Currently active tab ID (for controlled mode) */
  activeTab?: string;
  /** Default active tab ID (for uncontrolled mode) */
  defaultActiveTab?: string;
  /** Callback fired when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Additional CSS class name */
  className?: string;
  /** Tab button variant */
  variant?: 'default' | 'pills';
  /** Size of the tabs */
  size?: 'sm' | 'md' | 'lg';
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  defaultActiveTab,
  onTabChange,
  className = '',
  variant = 'default',
  size = 'md'
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<string>(
    defaultActiveTab || items[0]?.id || ''
  );
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const isControlled = activeTab !== undefined;
  const currentActiveTab = isControlled ? activeTab : internalActiveTab;

  const handleTabClick = (tabId: string) => {
    if (items.find(item => item.id === tabId)?.disabled) return;
    
    if (!isControlled) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  const handleKeyDown = (event: React.KeyboardEvent, currentTabId: string) => {
    const enabledTabs = items.filter(item => !item.disabled);
    const currentIndex = enabledTabs.findIndex(item => item.id === currentTabId);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : enabledTabs.length - 1;
        break;
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = currentIndex < enabledTabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = enabledTabs.length - 1;
        break;
      default:
        return;
    }

    const nextTab = enabledTabs[nextIndex];
    if (nextTab) {
      handleTabClick(nextTab.id);
      tabRefs.current[nextTab.id]?.focus();
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          fontSize: 'var(--font-size-sm)',
          padding: 'var(--space-2) var(--space-3)'
        };
      case 'lg':
        return {
          fontSize: 'var(--font-size-lg)',
          padding: 'var(--space-4) var(--space-6)'
        };
      default:
        return {
          fontSize: 'var(--font-size-base)',
          padding: 'var(--space-3) var(--space-4)'
        };
    }
  };

  const getTabButtonStyles = (isActive: boolean, isDisabled: boolean) => {
    const baseStyles = {
      ...getSizeStyles(),
      fontFamily: 'var(--font-family-sans)',
      fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
      border: 'none',
      background: 'transparent',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      transition: 'var(--transition-normal)',
      outline: 'none',
      position: 'relative' as const,
      whiteSpace: 'nowrap' as const
    };

    if (variant === 'pills') {
      return {
        ...baseStyles,
        borderRadius: 'var(--radius-md)',
        backgroundColor: isActive 
          ? 'var(--color-primary-500)' 
          : isDisabled 
            ? 'var(--color-neutral-100)'
            : 'transparent',
        color: isActive 
          ? 'var(--color-text-inverse)' 
          : isDisabled 
            ? 'var(--color-text-disabled)'
            : 'var(--color-text-primary)'
      };
    }

    return {
      ...baseStyles,
      borderBottom: isActive 
        ? '2px solid var(--color-primary-500)' 
        : '2px solid transparent',
      color: isActive 
        ? 'var(--color-primary-600)' 
        : isDisabled 
          ? 'var(--color-text-disabled)'
          : 'var(--color-text-secondary)',
      marginBottom: '-2px'
    };
  };

  const getTabListStyles = () => {
    const baseStyles = {
      display: 'flex',
      gap: variant === 'pills' ? 'var(--space-2)' : 'var(--space-1)',
      margin: 0,
      padding: 0,
      listStyle: 'none'
    };

    if (variant === 'default') {
      return {
        ...baseStyles,
        borderBottom: '2px solid var(--color-border-default)'
      };
    }

    return baseStyles;
  };

  const activeTabContent = items.find(item => item.id === currentActiveTab)?.content;

  return (
    <div 
      className={className}
      style={{
        fontFamily: 'var(--font-family-sans)'
      }}
    >
      <div
        role="tablist"
        style={getTabListStyles()}
      >
        {items.map((item) => {
          const isActive = item.id === currentActiveTab;
          const isDisabled = item.disabled || false;
          
          return (
            <button
              key={item.id}
              ref={(el) => { tabRefs.current[item.id] = el; }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={isDisabled}
              onClick={() => handleTabClick(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              style={{
                ...getTabButtonStyles(isActive, isDisabled),
                ...(isActive && variant === 'default' && {
                  ':focus': {
                    boxShadow: '0 0 0 2px var(--color-primary-200)'
                  }
                })
              }}
              onFocus={(e) => {
                if (variant === 'default') {
                  e.target.style.boxShadow = '0 0 0 2px var(--color-primary-200)';
                }
              }}
              onBlur={(e) => {
                if (variant === 'default') {
                  e.target.style.boxShadow = 'none';
                }
              }}
              onMouseEnter={(e) => {
                if (!isDisabled && !isActive) {
                  if (variant === 'pills') {
                    e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
                  } else {
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled && !isActive) {
                  if (variant === 'pills') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  } else {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      
      <div
        role="tabpanel"
        id={`tabpanel-${currentActiveTab}`}
        aria-labelledby={currentActiveTab}
        style={{
          marginTop: 'var(--space-4)',
          outline: 'none'
        }}
        tabIndex={0}
      >
        {activeTabContent}
      </div>
    </div>
  );
};