import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import '../../../styles/qa.css';

export function FileDropzone({ onSelect }) {
  const [preview, setPreview] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setFileInfo({ name: file.name, width: img.width, height: img.height });
      setPreview(url);
      onSelect({ file, type: 'image', preview: url, width: img.width, height: img.height });
    };
    img.src = url;
  }, [onSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleClear = () => {
    setPreview(null);
    setFileInfo(null);
    onSelect(null);
  };

  if (fileInfo) {
    return (
      <div className="card">
        <div className="qa-file-preview">
          <img src={preview} alt="Preview" className="qa-file-preview-image" />
          <div className="qa-file-preview-meta">
            <p className="qa-file-preview-name">{fileInfo.name}</p>
            <p className="qa-file-preview-dims">
              {fileInfo.width} × {fileInfo.height}
            </p>
          </div>
          <button onClick={handleClear} className="qa-icon-button" type="button" aria-label="Clear selected file">
            <X size={20} />
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
      <p className="qa-dropzone-subtitle">PNG, JPG, or WebP</p>
    </div>
  );
}

export default FileDropzone;
