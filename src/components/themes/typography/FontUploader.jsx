/**
 * @chunk 2.23 - FontUploader
 * 
 * Upload custom font files (.woff2, .woff, .ttf, .otf) for custom typefaces.
 */

import { useState, useRef } from 'react';
import { Upload, Trash2, FileText, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { typefaceService } from '../../../services/typefaceService';
import { cn } from '../../../lib/utils';

// Accepted font formats with MIME types
const ACCEPTED_FORMATS = {
  'woff2': 'font/woff2',
  'woff': 'font/woff',
  'ttf': 'font/ttf',
  'otf': 'font/otf'
};

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Parse font weight from filename
 * @param {string} filename - Font filename
 * @returns {number} - Font weight (100-900)
 */
export function parseWeightFromFilename(filename) {
  // Order matters: check longer/more specific strings first
  // Patterns containing other patterns must come before the shorter ones
  const weightPatterns = [
    // 900
    { pattern: 'black', weight: 900 },
    { pattern: 'heavy', weight: 900 },
    // 800 - 'extrabold' & 'ultrabold' contain 'bold', must check first
    { pattern: 'extrabold', weight: 800 },
    { pattern: 'ultrabold', weight: 800 },
    // 600 - 'semibold' & 'demibold' contain 'bold', must check before 'bold'
    { pattern: 'semibold', weight: 600 },
    { pattern: 'demibold', weight: 600 },
    // 700 - check 'bold' after all *bold variants
    { pattern: 'bold', weight: 700 },
    // 500
    { pattern: 'medium', weight: 500 },
    // 400
    { pattern: 'regular', weight: 400 },
    { pattern: 'normal', weight: 400 },
    // 200 - 'extralight' & 'ultralight' contain 'light', must check first
    { pattern: 'extralight', weight: 200 },
    { pattern: 'ultralight', weight: 200 },
    // 300 - check 'light' after all *light variants
    { pattern: 'light', weight: 300 },
    // 100
    { pattern: 'thin', weight: 100 },
    { pattern: 'hairline', weight: 100 },
  ];

  const lower = filename.toLowerCase();
  for (const { pattern, weight } of weightPatterns) {
    if (lower.includes(pattern)) return weight;
  }
  return 400;
}

/**
 * Parse font style from filename
 * @param {string} filename - Font filename
 * @returns {string} - Font style ('normal' | 'italic')
 */
export function parseStyleFromFilename(filename) {
  return filename.toLowerCase().includes('italic') ? 'italic' : 'normal';
}

/**
 * Format bytes to human readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get weight label
 * @param {number} weight - Font weight
 * @returns {string} - Weight label
 */
function getWeightLabel(weight) {
  const labels = {
    100: 'Thin',
    200: 'Extra Light',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'Semi Bold',
    700: 'Bold',
    800: 'Extra Bold',
    900: 'Black'
  };
  return labels[weight] || weight.toString();
}

/**
 * FontUploader component
 * @param {Object} props
 * @param {string} props.typefaceId - Typeface UUID to upload files for
 * @param {Array} props.existingFiles - Existing font files already uploaded
 * @param {function} props.onUploadComplete - Callback when upload completes
 * @param {function} props.onFileDeleted - Callback when a file is deleted
 */
export default function FontUploader({ 
  typefaceId, 
  existingFiles = [], 
  onUploadComplete,
  onFileDeleted 
}) {
  const [uploads, setUploads] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  // Combine existing files with new uploads
  const allFiles = [...existingFiles, ...uploads];

  /**
   * Validate file before upload
   */
  const validateFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (!ACCEPTED_FORMATS[ext]) {
      return { valid: false, error: `Invalid format: ${ext}. Use woff2, woff, ttf, or otf.` };
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File too large: ${file.name}. Max size is 5MB.` };
    }
    
    return { valid: true };
  };

  /**
   * Handle file selection/drop
   */
  const handleFiles = async (files) => {
    const fileList = Array.from(files);
    
    // Validate all files first
    const validFiles = [];
    for (const file of fileList) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);

    for (const file of validFiles) {
      try {
        // Parse weight and style from filename
        const weight = parseWeightFromFilename(file.name);
        const style = parseStyleFromFilename(file.name);

        const fontFile = await typefaceService.uploadFontFile(
          typefaceId,
          file,
          weight,
          style
        );

        setUploads(prev => [...prev, fontFile]);
        toast.success(`Uploaded ${file.name}`);
      } catch (error) {
        console.error('Failed to upload font:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
    onUploadComplete?.();
  };

  /**
   * Handle file deletion
   */
  const handleDelete = async (fileId) => {
    setDeletingId(fileId);
    
    try {
      await typefaceService.deleteFontFile(fileId);
      
      // Remove from local state
      setUploads(prev => prev.filter(f => f.id !== fileId));
      
      toast.success('Font file deleted');
      onFileDeleted?.(fileId);
    } catch (error) {
      console.error('Failed to delete font:', error);
      toast.error('Failed to delete font file');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Handle drag events
   */
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="font-uploader">
      {/* Upload Zone */}
      <div
        className={cn(
          'font-uploader-zone',
          { 'font-uploader-zone--dragging': isDragging },
          { 'font-uploader-zone--uploading': isUploading }
        )}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".woff2,.woff,.ttf,.otf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          hidden
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="font-uploader-loading">
            <Loader2 size={24} className="spin" />
            <span>Uploading...</span>
          </div>
        ) : (
          <div className="font-uploader-content">
            <Upload size={24} />
            <p className="font-uploader-text">
              Drop font files here or click to browse
            </p>
            <p className="font-uploader-hint">
              woff2, woff, ttf, otf (max 5MB each)
            </p>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {allFiles.length > 0 && (
        <div className="font-uploader-files">
          <h4 className="font-uploader-files-title">
            Uploaded Files ({allFiles.length})
          </h4>
          <div className="font-uploader-files-list">
            {allFiles.map(file => (
              <div key={file.id} className="font-file-item">
                <div className="font-file-icon">
                  <FileText size={16} />
                </div>
                <div className="font-file-info">
                  <span className="font-file-format">{file.format.toUpperCase()}</span>
                  <span className="font-file-weight">
                    {getWeightLabel(file.weight)}
                    {file.style === 'italic' && ' Italic'}
                  </span>
                </div>
                <span className="font-file-size">
                  {formatBytes(file.file_size)}
                </span>
                <button
                  className="font-file-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file.id);
                  }}
                  disabled={deletingId === file.id}
                  title="Delete font file"
                >
                  {deletingId === file.id ? (
                    <Loader2 size={14} className="spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Format Priority Hint */}
      {allFiles.length === 0 && (
        <div className="font-uploader-format-hint">
          <AlertCircle size={14} />
          <span>
            <strong>woff2</strong> is recommended for best compression and browser support.
          </span>
        </div>
      )}
    </div>
  );
}

