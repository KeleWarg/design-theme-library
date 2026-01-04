/**
 * @chunk 2.02 - ThemeCard Component
 * 
 * Dropdown menu component for action menus.
 * Provides a composable API with compound components.
 */

import { useState, useRef, useEffect, createContext, useContext } from 'react';

const DropdownContext = createContext({ isOpen: false, setIsOpen: () => {} });

function DropdownMenu({ trigger, children, align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);
  
  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);
  
  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="dropdown-menu" ref={menuRef}>
        <div 
          className="dropdown-trigger"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {trigger}
        </div>
        
        {isOpen && (
          <div className={`dropdown-content dropdown-align-${align}`}>
            {children}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
}

function DropdownItem({ children, onClick, danger = false, disabled = false }) {
  const { setIsOpen } = useContext(DropdownContext);
  
  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    
    onClick?.(e);
    setIsOpen(false);
  };
  
  return (
    <button 
      className={`dropdown-item ${danger ? 'dropdown-item-danger' : ''} ${disabled ? 'dropdown-item-disabled' : ''}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function DropdownSeparator() {
  return <div className="dropdown-separator" />;
}

// Attach subcomponents
DropdownMenu.Item = DropdownItem;
DropdownMenu.Separator = DropdownSeparator;

export default DropdownMenu;


