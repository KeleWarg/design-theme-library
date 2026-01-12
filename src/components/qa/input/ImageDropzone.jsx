import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

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
      <div className="relative">
        <img src={preview} alt="Preview" className="max-h-64 rounded-lg" />
        <div className="text-sm text-gray-500 mt-2">
          {dimensions?.width} × {dimensions?.height}
        </div>
        <button onClick={handleClear} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
      <p className="text-gray-600">Drop an image here, or click to select</p>
      <p className="text-sm text-gray-400 mt-2">PNG, JPG, WebP up to 10MB</p>
    </div>
  );
}
