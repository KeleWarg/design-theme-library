/**
 * @chunk 3.14 - CodeTab (Monaco Editor)
 * 
 * Full code editor for component JSX with Monaco Editor.
 * Features: syntax highlighting, read-only by default, edit mode toggle,
 * copy code button, and explicit Save/Cancel pattern (no auto-save).
 */

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '../../ui';
import { CopyIcon, CheckIcon, EditIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { componentService } from '../../../services/componentService';

export default function CodeTab({ component, onSave, onChangesMade }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(component.code || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syntaxError, setSyntaxError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset when component changes
  useEffect(() => {
    setEditedCode(component.code || '');
    setHasChanges(false);
    setIsEditing(false);
    setSyntaxError(null);
  }, [component.code]);

  // Track changes
  const handleCodeChange = (value) => {
    setEditedCode(value || '');
    const changed = value !== (component.code || '');
    setHasChanges(changed);
    
    if (changed && onChangesMade) {
      onChangesMade();
    }
    
    // Basic syntax validation
    if (value) {
      try {
        // Try to parse as JavaScript/JSX
        new Function(value);
        setSyntaxError(null);
      } catch (e) {
        setSyntaxError(e.message);
      }
    } else {
      setSyntaxError(null);
    }
  };

  // Enter edit mode
  const handleEdit = () => {
    setIsEditing(true);
    setEditedCode(component.code || '');
    setHasChanges(false);
    setSyntaxError(null);
  };

  // Cancel editing - revert changes
  const handleCancel = () => {
    setEditedCode(component.code || '');
    setHasChanges(false);
    setIsEditing(false);
    setSyntaxError(null);
    if (onChangesMade) {
      onChangesMade();
    }
  };

  // Save explicitly
  const handleSave = async () => {
    if (syntaxError) {
      toast.error('Please fix syntax errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      await componentService.updateComponent(component.id, { code: editedCode });
      setHasChanges(false);
      setIsEditing(false);
      setSyntaxError(null);
      if (onSave) {
        onSave(editedCode);
      }
      toast.success('Code saved successfully');
    } catch (error) {
      console.error('Failed to save code:', error);
      toast.error('Failed to save code');
    } finally {
      setIsSaving(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    const codeToCopy = isEditing ? editedCode : (component.code || '');
    try {
      await navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const currentCode = isEditing ? editedCode : (component.code || '');
  const isEmpty = !currentCode || currentCode.trim() === '';

  return (
    <div className="code-tab">
      <div className="code-toolbar">
        <div className="toolbar-left">
          {syntaxError && isEditing && (
            <span className="syntax-error" title={syntaxError}>
              ⚠️ Syntax Error
            </span>
          )}
          {isEmpty && !isEditing && (
            <span className="empty-state">No code available</span>
          )}
        </div>
        <div className="toolbar-right">
          <Button 
            variant="ghost" 
            size="small" 
            onClick={handleCopy}
            disabled={isEmpty}
          >
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          {!isEditing ? (
            <Button 
              variant="secondary" 
              size="small" 
              onClick={handleEdit}
            >
              <EditIcon size={16} />
              Edit
            </Button>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="small" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                <XIcon size={16} />
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="small" 
                onClick={handleSave}
                disabled={!!syntaxError || !hasChanges || isSaving}
                loading={isSaving}
              >
                Save Code
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="editor-container">
        {isEmpty && !isEditing ? (
          <div className="code-empty">
            <p>No code available for this component.</p>
            <Button variant="secondary" size="small" onClick={handleEdit}>
              <EditIcon size={16} />
              Add Code
            </Button>
          </div>
        ) : (
          <Editor
            height="500px"
            language="javascript"
            theme="vs-dark"
            value={currentCode}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              formatOnPaste: true,
              automaticLayout: true,
              tabSize: 2,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              readOnly: !isEditing,
              fontFamily: 'var(--font-family-mono)',
            }}
          />
        )}
      </div>

      <style>{`
        .code-tab {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .code-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .toolbar-right {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .syntax-error {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--color-error);
          color: white;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
        }

        .empty-state {
          color: var(--color-muted-foreground);
          font-size: var(--font-size-sm);
        }

        .editor-container {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--color-background);
        }

        .code-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          padding: var(--spacing-2xl);
          min-height: 500px;
          color: var(--color-muted-foreground);
          text-align: center;
        }

        .code-empty p {
          margin: 0;
          font-size: var(--font-size-base);
        }
      `}</style>
    </div>
  );
}

