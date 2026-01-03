import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  /** Array of options to display in the dropdown */
  options: DropdownOption[];
  /** Currently selected value */
  value?: string;
  /** Callback fired when selection changes */
  onChange?: (value: string) => void;
  /** Placeholder text when no option is selected */
  placeholder?: string;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Custom width for the dropdown */
  width?: string;
  /** Whether the dropdown is in an error state */
  error?: boolean;
  /** Custom render function for options */
  renderOption?: (option: DropdownOption) => React.ReactNode;
  /** Test ID for testing purposes */
  testId?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  width = '200px',
  error = false,
  renderOption,
  testId = 'dropdown'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<(HTMLDivElement | null)[]>([]);

  const selectedOption = options.find(option => option.value === value);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev);
      setFocusedIndex(-1);
    }
  }, [disabled]);

  const handleSelect = useCallback((optionValue: string) => {
    const option = options.find(opt => opt.value === optionValue);
    if (option && !option.disabled) {
      onChange?.(optionValue);
      setIsOpen(false);
      setFocusedIndex(-1);
      triggerRef.current?.focus();
    }
  }, [options, onChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else if (focusedIndex >= 0) {
          const option = options[focusedIndex];
          if (!option.disabled) {
            handleSelect(option.value);
          }
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => {
            const nextIndex = prev < options.length - 1 ? prev + 1 : 0;
            return nextIndex;
          });
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(options.length - 1);
        } else {
          setFocusedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : options.length - 1;
            return nextIndex;
          });
        }
        break;
    }
  }, [disabled, isOpen, focusedIndex, options, handleSelect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [focusedIndex, isOpen]);

  const triggerStyle: React.CSSProperties = {
    width,
    padding: 'var(--space-3) var(--space-4)',
    backgroundColor: disabled ? 'var(--color-neutral-100)' : 'var(--color-bg-default)',
    border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border-default)'}`,
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-base)',
    fontFamily: 'var(--font-family-sans)',
    color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'var(--transition-fast)',
    outline: 'none',
    boxShadow: isOpen ? '0 0 0 2px var(--color-primary-200)' : 'none'
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'var(--color-bg-default)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 'var(--z-dropdown)',
    maxHeight: '200px',
    overflowY: 'auto',
    marginTop: 'var(--space-1)'
  };

  const optionStyle = (index: number, option: DropdownOption): React.CSSProperties => ({
    padding: 'var(--space-3) var(--space-4)',
    fontSize: 'var(--font-size-base)',
    fontFamily: 'var(--font-family-sans)',
    color: option.disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
    backgroundColor: focusedIndex === index ? 'var(--color-primary-50)' : 'transparent',
    cursor: option.disabled ? 'not-allowed' : 'pointer',
    transition: 'var(--transition-fast)',
    borderBottom: index < options.length - 1 ? '1px solid var(--color-border-subtle)' : 'none'
  });

  const chevronStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    transition: 'var(--transition-fast)',
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    marginLeft: 'var(--space-2)'
  };

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block' }}
      data-testid={testId}
    >
      <button
        ref={triggerRef}
        type="button"
        style={triggerStyle}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-testid={`${testId}-trigger`}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          style={chevronStyle}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div style={dropdownStyle} role="listbox" data-testid={`${testId}-menu`}>
          {options.map((option, index) => (
            <div
              key={option.value}
              ref={el => optionsRef.current[index] = el}
              style={optionStyle(index, option)}
              onClick={() => !option.disabled && handleSelect(option.value)}
              onMouseEnter={() => setFocusedIndex(index)}
              role="option"
              aria-selected={option.value === value}
              aria-disabled={option.disabled}
              data-testid={`${testId}-option-${option.value}`}
            >
              {renderOption ? renderOption(option) : option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};