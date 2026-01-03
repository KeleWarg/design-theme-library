# Chunk 5.20 — ZIP Download

## Purpose
Create downloadable ZIP from export files.

---

## Inputs
- Export files object

## Outputs
- ZIP file download

---

## Dependencies
- Chunk 5.19 must be complete

---

## Implementation Notes

```javascript
// src/services/zipService.js
import JSZip from 'jszip';

export async function createExportZip(files, options = {}) {
  const { filename = 'design-system-export.zip', onProgress } = options;
  const zip = new JSZip();
  
  const entries = Object.entries(files);
  let processed = 0;

  for (const [path, content] of entries) {
    if (typeof content === 'string') {
      // Text content
      zip.file(path, content);
    } else if (content?.url && content?.type === 'binary') {
      // Binary file from URL (fonts, images)
      try {
        const response = await fetch(content.url);
        if (response.ok) {
          const blob = await response.blob();
          zip.file(path, blob);
        }
      } catch (error) {
        console.warn(`Failed to fetch ${content.url}:`, error);
      }
    } else if (content instanceof Blob) {
      zip.file(path, content);
    }
    
    processed++;
    if (onProgress) {
      onProgress((processed / entries.length) * 100);
    }
  }

  const blob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
  return blob;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadExportZip(files, options = {}) {
  const blob = await createExportZip(files, options);
  downloadBlob(blob, options.filename || 'design-system-export.zip');
  return blob;
}
```

### Export Result Dialog
```jsx
// src/components/export/ExportResultDialog.jsx
import { useState } from 'react';
import { Dialog, Button } from '../ui';
import { downloadExportZip } from '../../services/zipService';
import { DownloadIcon, CopyIcon, CheckIcon, FolderIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function ExportResultDialog({ result, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedFile, setCopiedFile] = useState(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadExportZip(result.files, {
        filename: `${result.projectName}-v${result.version}.zip`,
        onProgress: setProgress
      });
      toast.success('Download started');
    } catch (error) {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  const handleCopyFile = async (path) => {
    const content = result.files[path];
    if (typeof content === 'string') {
      await navigator.clipboard.writeText(content);
      setCopiedFile(path);
      setTimeout(() => setCopiedFile(null), 2000);
      toast.success(`Copied ${path}`);
    }
  };

  // Group files by directory
  const groupedFiles = groupFilesByDirectory(Object.keys(result.files));

  return (
    <Dialog open onClose={onClose} size="lg">
      <Dialog.Title>Export Complete</Dialog.Title>
      <Dialog.Content>
        <div className="export-summary">
          <p>
            <strong>{result.fileCount}</strong> files generated for{' '}
            <strong>{result.projectName}</strong> v{result.version}
          </p>
        </div>

        <div className="file-tree">
          {Object.entries(groupedFiles).map(([dir, files]) => (
            <div key={dir} className="file-group">
              {dir && (
                <div className="dir-name">
                  <FolderIcon size={14} />
                  {dir}/
                </div>
              )}
              {files.map(path => (
                <div key={path} className="file-item">
                  <span className="file-path">
                    {dir ? path.replace(`${dir}/`, '') : path}
                  </span>
                  {typeof result.files[path] === 'string' && (
                    <Button 
                      size="xs" 
                      variant="ghost" 
                      onClick={() => handleCopyFile(path)}
                    >
                      {copiedFile === path ? (
                        <CheckIcon size={14} />
                      ) : (
                        <CopyIcon size={14} />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {downloading && (
          <div className="download-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        )}
      </Dialog.Content>
      <Dialog.Actions>
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button onClick={handleDownload} loading={downloading}>
          <DownloadIcon size={16} /> Download ZIP
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}

function groupFilesByDirectory(paths) {
  const groups = { '': [] };
  
  for (const path of paths) {
    const parts = path.split('/');
    if (parts.length === 1) {
      groups[''].push(path);
    } else {
      const dir = parts[0];
      if (!groups[dir]) groups[dir] = [];
      groups[dir].push(path);
    }
  }
  
  return groups;
}
```

---

## Files Created
- `src/services/zipService.js` — ZIP creation
- `src/components/export/ExportResultDialog.jsx` — Result dialog

---

## Tests

### Unit Tests
- [ ] ZIP created with all files
- [ ] Binary files fetched and included
- [ ] Download triggers correctly
- [ ] Copy to clipboard works
- [ ] Progress updates during creation

---

## Time Estimate
1.5 hours
