/**
 * @chunk 5.20 - ZIP Download
 * 
 * Service for creating ZIP files from export data and triggering downloads.
 * Handles string content, blobs, and remote URLs (for font files).
 */

import JSZip from 'jszip';

/**
 * Create a ZIP file from export files
 * @param {Object} files - Object mapping file paths to content (string, Blob, or {url, type: 'binary'})
 * @param {Object} options - Options
 * @param {string} options.filename - ZIP filename (default: 'design-system-export.zip')
 * @param {Function} options.onProgress - Progress callback (0-100)
 * @returns {Promise<{blob: Blob, warnings: string[]}>} - ZIP file blob and any warnings
 */
export async function createExportZip(files, options = {}) {
  const { filename = 'design-system-export.zip', onProgress } = options;
  const zip = new JSZip();
  const warnings = [];

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
        } else {
          const warning = `Failed to fetch ${path}: HTTP ${response.status}`;
          console.warn(warning);
          warnings.push(warning);
        }
      } catch (error) {
        const warning = `Failed to fetch ${path}: ${error.message}`;
        console.warn(warning);
        warnings.push(warning);
      }
    } else if (content instanceof Blob) {
      zip.file(path, content);
    } else if (content === null || content === undefined) {
      const warning = `Skipped ${path}: content is null or undefined`;
      console.warn(warning);
      warnings.push(warning);
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

  return { blob, warnings };
}

/**
 * Download a blob as a file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for download
 */
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

/**
 * Create and download a ZIP file from export files
 * @param {Object} files - Object mapping file paths to content
 * @param {Object} options - Options (see createExportZip)
 * @returns {Promise<{blob: Blob, warnings: string[]}>} - ZIP file blob and any warnings
 */
export async function downloadExportZip(files, options = {}) {
  const { blob, warnings } = await createExportZip(files, options);
  downloadBlob(blob, options.filename || 'design-system-export.zip');
  return { blob, warnings };
}



