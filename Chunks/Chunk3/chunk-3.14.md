# Chunk 3.14 — CodeTab (Monaco Editor)

## Purpose
Full code editor for component JSX.

---

## Inputs
- Component code

## Outputs
- Updated code

---

## Dependencies
- Chunk 3.12 must be complete

---

## Implementation Notes

```jsx
// src/components/components/detail/CodeTab.jsx
import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '../../ui';
import { CopyIcon, CheckIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function CodeTab({ component, onSave, onChangesMade }) {
  const [code, setCode] = useState(component.code || '');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCode(component.code || '');
  }, [component.code]);

  const handleEditorChange = (value) => {
    setCode(value);
    onChangesMade();
    
    // Basic syntax validation
    try {
      new Function(value);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave(code);
  };

  return (
    <div className="code-tab">
      <div className="code-toolbar">
        <div className="toolbar-left">
          {error && (
            <span className="syntax-error" title={error}>
              ⚠️ Syntax Error
            </span>
          )}
        </div>
        <div className="toolbar-right">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!!error}>
            Save
          </Button>
        </div>
      </div>

      <div className="editor-container">
        <Editor
          height="500px"
          language="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            formatOnPaste: true,
            automaticLayout: true,
            tabSize: 2,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}
```

---

## Files Created
- `src/components/components/detail/CodeTab.jsx` — Code editor tab

---

## Tests

### Unit Tests
- [ ] Monaco editor loads
- [ ] Code changes trigger onChangesMade
- [ ] Save button calls onSave
- [ ] Copy to clipboard works
- [ ] Syntax errors displayed

---

## Time Estimate
2.5 hours

---

## Notes
Monaco Editor is installed via `@monaco-editor/react`. Ensure it's added to package.json.
