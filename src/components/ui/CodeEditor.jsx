/**
 * @chunk 3.10 - AIGenerationFlow
 * 
 * Simple code editor component with syntax highlighting support.
 * Uses a textarea with monospace font - can be upgraded to Monaco later.
 */

import { useRef, useEffect } from 'react';

/**
 * Code editor component
 * @param {Object} props
 * @param {string} props.value - Code content
 * @param {Function} props.onChange - Change handler
 * @param {string} props.language - Language for syntax highlighting hint
 * @param {boolean} props.readOnly - Whether the editor is read-only
 * @param {number} props.minHeight - Minimum height in pixels
 * @param {string} props.className - Additional class names
 */
export default function CodeEditor({
  value = '',
  onChange,
  language = 'jsx',
  readOnly = false,
  minHeight = 300,
  className = ''
}) {
  const textareaRef = useRef(null);

  // Handle tab key for indentation
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange?.(newValue);
      
      // Set cursor position after the tab
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      });
    }
  };

  // Auto-resize based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(minHeight, textareaRef.current.scrollHeight)}px`;
    }
  }, [value, minHeight]);

  return (
    <div className={`code-editor ${className}`}>
      <textarea
        ref={textareaRef}
        className="code-editor-textarea"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        data-language={language}
        style={{ minHeight: `${minHeight}px` }}
      />
    </div>
  );
}


