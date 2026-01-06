/**
 * @chunk 5.20 - ZIP Download
 * 
 * Export result dialog showing file list, copy buttons, and ZIP download.
 */

import { useState } from 'react';
import { Modal, Button } from '../ui';
import { downloadExportZip } from '../../services/zipService';
import { Download, Copy, Check, Folder } from 'lucide-react';
import { toast } from 'sonner';

export default function ExportResultDialog({ result, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedFile, setCopiedFile] = useState(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { warnings } = await downloadExportZip(result.files, {
        filename: `${result.projectName}-v${result.version}.zip`,
        onProgress: setProgress
      });

      if (warnings && warnings.length > 0) {
        toast.warning(`Download complete with ${warnings.length} warning(s). Check console for details.`);
        console.warn('Export warnings:', warnings);
      } else {
        toast.success('Download started');
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed: ' + (error.message || 'Unknown error'));
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  const handleCopyFile = async (path) => {
    const content = result.files[path];
    if (typeof content === 'string') {
      try {
        await navigator.clipboard.writeText(content);
        setCopiedFile(path);
        setTimeout(() => setCopiedFile(null), 2000);
        toast.success(`Copied ${path}`);
      } catch (error) {
        console.error('Copy failed:', error);
        toast.error('Copy failed');
      }
    }
  };

  // Group files by directory
  const groupedFiles = groupFilesByDirectory(Object.keys(result.files));

  return (
    <Modal open={!!result} onClose={onClose} size="large" title="Export Complete">
      <div className="export-result-dialog">
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
                  <Folder size={14} />
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
                      size="small"
                      variant="ghost" 
                      onClick={() => handleCopyFile(path)}
                      className="file-copy-btn"
                    >
                      {copiedFile === path ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
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

        <div className="dialog-footer">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button onClick={handleDownload} loading={downloading}>
            <Download size={16} /> Download ZIP
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Group file paths by directory
 * @param {Array<string>} paths - Array of file paths
 * @returns {Object} - Object mapping directory names to arrays of file paths
 */
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
