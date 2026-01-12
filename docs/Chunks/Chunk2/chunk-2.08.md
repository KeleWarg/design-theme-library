# Chunk 2.08 — UploadStep

## Purpose
File upload step with drag-and-drop and JSON validation.

---

## Inputs
- ImportWizard container (from chunk 2.07)
- tokenParser (from chunk 1.12)

## Outputs
- Parsed tokens to wizard state
- Validation errors displayed

---

## Dependencies
- Chunk 2.07 must be complete
- Chunk 1.12 must be complete

---

## Implementation Notes

### Key Considerations
- Accept .json files only
- Max file size: 5MB
- Validate JSON structure
- Show parsing errors clearly
- Display supported format hints

### Component Structure

```jsx
// src/components/themes/import/UploadStep.jsx
import { useState, useRef } from 'react';
import { parseTokenFile } from '../../../lib/tokenParser';
import { UploadCloudIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

export default function UploadStep({ data, onUpdate, onNext }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    // Validate file type
    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const { tokens, errors, warnings } = parseTokenFile(json);

      if (errors.length > 0) {
        setError(`Parsing errors: ${errors.join(', ')}`);
        return;
      }

      if (tokens.length === 0) {
        setError('No tokens found in file');
        return;
      }

      // Initialize mappings with detected categories
      const mappings = tokens.reduce((acc, t) => {
        acc[t.path] = t.category;
        return acc;
      }, {});

      onUpdate({
        file,
        parsedTokens: tokens,
        warnings,
        mappings
      });

      if (warnings.length > 0) {
        toast.warning(`${warnings.length} warnings during parsing`);
      }

      toast.success(`Parsed ${tokens.length} tokens`);
      onNext();
    } catch (e) {
      setError('Invalid JSON file: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div className="upload-step">
      <div
        className={cn('drop-zone', { 
          dragging: isDragging, 
          error: !!error,
          processing: isProcessing
        })}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={(e) => handleFile(e.target.files[0])}
          hidden
        />
        
        {isProcessing ? (
          <div className="processing">
            <Spinner />
            <p>Processing file...</p>
          </div>
        ) : (
          <>
            <UploadCloudIcon className="upload-icon" size={48} />
            <p className="primary-text">
              Drag and drop your JSON file here
            </p>
            <p className="secondary-text">or click to browse</p>
          </>
        )}
      </div>

      {error && (
        <div className="error-message">
          <AlertCircleIcon size={16} />
          {error}
        </div>
      )}

      <div className="format-help">
        <h4>Supported Formats</h4>
        <ul>
          <li>Figma Variables JSON export</li>
          <li>Style Dictionary format</li>
          <li>Flat token JSON (key-value pairs)</li>
        </ul>
        <p className="hint">
          Max file size: 5MB
        </p>
      </div>
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/import/UploadStep.jsx` — Upload step component

---

## Tests

### Unit Tests
- [ ] Shows drop zone
- [ ] Drag over sets isDragging state
- [ ] Rejects non-JSON files
- [ ] Rejects files over 5MB
- [ ] Parses valid JSON successfully
- [ ] Shows parsing errors
- [ ] Shows processing state
- [ ] Calls onNext after successful parse
- [ ] Initializes mappings from parsed tokens

---

## Time Estimate
2 hours

---

## Notes
The upload step is the entry point for imports. It uses the tokenParser from chunk 1.12 to validate and parse the JSON file before proceeding.
