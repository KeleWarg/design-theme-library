import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import '../../../styles/qa.css';

export function ImageDropzone({ onSelect }) {
  const [preview, setPreview] = useState(null);
  const [dimensions, setDimensions] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      setPreview(url);
      onSelect({ file, preview: url, width: img.width, height: img.height });
    };
    img.src = url;
  }, [onSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleClear = () => {
    setPreview(null);
    setDimensions(null);
    onSelect(null);
  };

  if (preview) {
    return (
      <div className="card">
        <img
          src={preview}
          alt="Preview"
          style={{
            maxHeight: '16rem',
            width: '100%',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            objectFit: 'contain',
            background: 'var(--color-muted)',
          }}
        />
        <div className="qa-file-preview-dims">
          {dimensions?.width} × {dimensions?.height}
        </div>
        <div style={{ marginTop: 'var(--spacing-sm)' }}>
          <button
            onClick={handleClear}
            className="qa-icon-button"
            type="button"
            aria-label="Clear selected image"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`qa-dropzone ${isDragActive ? 'qa-dropzone--active' : ''}`}
    >
      <input {...getInputProps()} />
      <Upload className="qa-dropzone-icon" size={48} />
      <p className="qa-dropzone-title">Drop an image here, or click to select</p>
      <p className="qa-dropzone-subtitle">PNG, JPG, WebP up to 10MB</p>
    </div>
  );
}
