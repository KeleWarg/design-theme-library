/**
 * @chunk 2.05 - ThemeSelector
 * 
 * Popover component for floating UI elements.
 * Provides positioning, click-outside handling, and keyboard support.
 */

import { useState, useRef, useEffect, createContext, useContext, cloneElement } from 'react';

const PopoverContext = createContext({ open: false, setOpen: () => {} });

/**
 * Root Popover component
 */
function Popover({ children, open: controlledOpen, onOpenChange }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  
  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled 
    ? (value) => onOpenChange?.(value) 
    : setUncontrolledOpen;
  
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      {children}
    </PopoverContext.Provider>
  );
}

/**
 * Trigger element that opens/closes the popover
 */
function PopoverTrigger({ children, asChild = false }) {
  const { open, setOpen } = useContext(PopoverContext);
  
  const handleClick = (e) => {
    e.stopPropagation();
    setOpen(!open);
  };
  
  if (asChild && children) {
    // Clone the child and add click handler
    return cloneElement(children, {
      onClick: (e) => {
        handleClick(e);
        children.props.onClick?.(e);
      },
      'aria-expanded': open,
      'aria-haspopup': 'true',
    });
  }
  
  return (
    <button 
      type="button" 
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup="true"
    >
      {children}
    </button>
  );
}

/**
 * Content container that appears when popover is open
 */
function PopoverContent({ 
  children, 
  className = '', 
  align = 'center',
  sideOffset = 4
}) {
  const { open, setOpen } = useContext(PopoverContext);
  const contentRef = useRef(null);
  
  // Handle click outside
  useEffect(() => {
    if (!open) return;
    
    function handleClickOutside(event) {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        // Check if click is on trigger (parent element context)
        const trigger = contentRef.current.parentElement?.querySelector('[aria-expanded]');
        if (trigger && trigger.contains(event.target)) return;
        
        setOpen(false);
      }
    }
    
    // Use a slight delay to avoid immediate close on trigger click
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);
  
  // Handle escape key
  useEffect(() => {
    if (!open) return;
    
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, setOpen]);
  
  if (!open) return null;
  
  const alignClass = {
    start: 'popover-align-start',
    center: 'popover-align-center',
    end: 'popover-align-end',
  }[align] || 'popover-align-center';
  
  return (
    <div 
      ref={contentRef}
      className={`popover-content ${alignClass} ${className}`}
      style={{ '--popover-offset': `${sideOffset}px` }}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

// Hook for consuming popover context
export function usePopover() {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('usePopover must be used within a Popover');
  }
  return context;
}

// Attach subcomponents
Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;

export { Popover, PopoverTrigger, PopoverContent };
export default Popover;

