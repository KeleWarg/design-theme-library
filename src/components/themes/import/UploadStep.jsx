/**
 * @chunk 2.08 - UploadStep
 * 
 * File upload step with drag-and-drop and JSON validation.
 * Accepts .json files only, max size 5MB.
 * Validates and parses token files before proceeding.
 */

import { useState, useRef } from 'react';
import { parseTokenFile } from '../../../lib/tokenParser';
import { UploadCloud, AlertCircle, Loader2, FileJson, CheckCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function UploadStep({ data, onUpdate, onNext }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  /**
   * Validate and process the uploaded file
   */
  const handleFile = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be under 5MB');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      let json;
      
      try {
        json = JSON.parse(text);
      } catch (parseError) {
        setError('Invalid JSON file: ' + parseError.message);
        setIsProcessing(false);
        return;
      }

      const { tokens, errors, warnings, metadata } = parseTokenFile(json);

      if (errors.length > 0) {
        setError(`Parsing errors: ${errors.join(', ')}`);
        setIsProcessing(false);
        return;
      }

      if (tokens.length === 0) {
        setError('No tokens found in file. Please check the file format.');
        setIsProcessing(false);
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
        metadata,
        mappings
      });

      if (warnings.length > 0) {
        toast.warning(`${warnings.length} warning${warnings.length > 1 ? 's' : ''} during parsing`);
      }

      toast.success(`Parsed ${tokens.length} token${tokens.length > 1 ? 's' : ''} successfully`);
      onNext();
    } catch (e) {
      setError('Error processing file: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle file drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  /**
   * Handle drag over
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  /**
   * Handle drag leave
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  /**
   * Handle click to browse
   */
  const handleClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  /**
   * Handle file input change
   */
  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input to allow re-selecting same file
    e.target.value = '';
  };

  return (
    <div className="upload-step">
      <div
        className={cn('drop-zone', {
          'drop-zone--dragging': isDragging,
          'drop-zone--error': !!error,
          'drop-zone--processing': isProcessing
        })}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Upload JSON file"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleInputChange}
          hidden
          aria-hidden="true"
        />

        {isProcessing ? (
          <div className="drop-zone__processing">
            <Loader2 className="drop-zone__spinner" size={48} />
            <p className="drop-zone__processing-text">Processing file...</p>
          </div>
        ) : (
          <>
            <div className="drop-zone__icon">
              <UploadCloud size={48} />
            </div>
            <p className="drop-zone__primary-text">
              Drag and drop your JSON file here
            </p>
            <p className="drop-zone__secondary-text">or click to browse</p>
          </>
        )}
      </div>

      {error && (
        <div className="upload-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {data.file && !error && (
        <div className="upload-success">
          <CheckCircle size={16} />
          <span>File uploaded: {data.file.name}</span>
        </div>
      )}

      <div className="format-help">
        <h4 className="format-help__title">
          <FileJson size={18} />
          Supported Formats
        </h4>
        <ul className="format-help__list">
          <li>Figma Variables JSON export (DTCG format)</li>
          <li>Style Dictionary format</li>
          <li>Flat token JSON (key-value pairs)</li>
        </ul>
        <p className="format-help__hint">
          Maximum file size: 5MB
        </p>
      </div>
    </div>
  );
}


