/**
 * @chunk B.4 - UploadIconModal Component
 * 
 * Modal for uploading custom SVG icons.
 */

import { useState, useRef } from 'react';
import { Upload, X, FileIcon } from 'lucide-react';
import { Modal, Input, Button } from '../ui';
import { toast } from 'sonner';
import { iconService } from '../../services/iconService';

export default function UploadIconModal({ open, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [style, setStyle] = useState('outline');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.includes('svg')) {
      toast.error('Please select an SVG file');
      return;
    }

    setFile(selectedFile);

    // Read file for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsText(selectedFile);

    // Auto-fill name from filename if empty
    if (!name) {
      const fileName = selectedFile.name.replace(/\.svg$/i, '');
      setName(fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileChange({ target: { files: [droppedFile] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter an icon name');
      return;
    }

    if (!file) {
      toast.error('Please select an SVG file');
      return;
    }

    setIsUploading(true);

    try {
      const tagArray = tags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);

      await iconService.createIcon(
        {
          name: name.trim(),
          style,
          source: 'custom',
          tags: tagArray
        },
        file
      );

      toast.success('Icon uploaded successfully');
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error('Failed to upload icon:', err);
      toast.error(err.message || 'Failed to upload icon');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setTags('');
    setStyle('outline');
    setFile(null);
    setPreview(null);
    onClose?.();
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Upload Icon">
      <form onSubmit={handleSubmit} className="upload-icon-form">
        {/* Drop zone */}
        <div
          className={`upload-dropzone ${file ? 'upload-dropzone--has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <div className="upload-preview">
              <div 
                className="upload-preview-svg"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
              <button
                type="button"
                className="upload-preview-clear"
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <Upload size={32} />
              <span>Drop SVG here or click to browse</span>
              <span className="upload-hint">Only SVG files are accepted</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {file && (
          <div className="upload-file-info">
            <FileIcon size={16} />
            <span>{file.name}</span>
          </div>
        )}

        <Input
          label="Icon Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Arrow Right"
          required
        />

        <div className="form-field">
          <label className="form-label">Style</label>
          <div className="upload-style-options">
            {['outline', 'filled', 'duotone', 'color'].map(s => (
              <button
                key={s}
                type="button"
                className={`upload-style-option ${style === s ? 'upload-style-option--selected' : ''}`}
                onClick={() => setStyle(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="arrow, navigation, ui (comma-separated)"
        />

        <div className="upload-actions">
          <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isUploading}>
            Upload Icon
          </Button>
        </div>
      </form>

      <style>{`
        .upload-icon-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg, 24px);
        }

        .upload-dropzone {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 160px;
          padding: var(--spacing-lg, 24px);
          border: 2px dashed var(--color-border, #e5e7eb);
          border-radius: var(--radius-lg, 8px);
          background: var(--color-muted, #f3f4f6);
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-dropzone:hover {
          border-color: var(--color-primary, #3b82f6);
          background: var(--color-primary-light, #eff6ff);
        }

        .upload-dropzone--has-file {
          border-style: solid;
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm, 8px);
          color: var(--color-muted-foreground, #6b7280);
          text-align: center;
        }

        .upload-hint {
          font-size: var(--font-size-xs, 12px);
          opacity: 0.7;
        }

        .upload-preview {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .upload-preview-svg {
          width: 64px;
          height: 64px;
          color: var(--color-foreground, #1a1a1a);
        }

        .upload-preview-svg svg {
          width: 100%;
          height: 100%;
        }

        .upload-preview-clear {
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          padding: 0;
          background: var(--color-background, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-full, 9999px);
          color: var(--color-muted-foreground, #6b7280);
          cursor: pointer;
          transition: all 0.15s;
        }

        .upload-preview-clear:hover {
          background: var(--color-error-light, #fee2e2);
          border-color: var(--color-error, #ef4444);
          color: var(--color-error, #ef4444);
        }

        .upload-file-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 8px);
          padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
          background: var(--color-muted, #f3f4f6);
          border-radius: var(--radius-md, 6px);
          font-size: var(--font-size-sm, 14px);
          color: var(--color-muted-foreground, #6b7280);
        }

        .upload-style-options {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs, 4px);
        }

        .upload-style-option {
          padding: var(--spacing-xs, 4px) var(--spacing-md, 16px);
          background: var(--color-background, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 6px);
          font-size: var(--font-size-sm, 14px);
          color: var(--color-muted-foreground, #6b7280);
          cursor: pointer;
          text-transform: capitalize;
          transition: all 0.15s;
        }

        .upload-style-option:hover {
          border-color: var(--color-primary, #3b82f6);
          color: var(--color-foreground, #1a1a1a);
        }

        .upload-style-option--selected {
          background: var(--color-primary, #3b82f6);
          border-color: var(--color-primary, #3b82f6);
          color: var(--color-primary-foreground, #ffffff);
        }

        .upload-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-sm, 8px);
          padding-top: var(--spacing-md, 16px);
          border-top: 1px solid var(--color-border, #e5e7eb);
        }
      `}</style>
    </Modal>
  );
}

