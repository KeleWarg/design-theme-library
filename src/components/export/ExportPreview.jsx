/**
 * @chunk 5.01 - ExportModal Shell
 * 
 * Preview panel showing what will be exported
 */

export default function ExportPreview({ themes, components, format }) {
  return (
    <div className="export-preview">
      <h4 className="preview-title">Preview</h4>
      <div className="preview-content">
        <div className="preview-section">
          <span className="preview-label">Themes:</span>
          <span className="preview-value">{themes.length} selected</span>
        </div>
        <div className="preview-section">
          <span className="preview-label">Components:</span>
          <span className="preview-value">{components.length} selected</span>
        </div>
        <div className="preview-section">
          <span className="preview-label">Format:</span>
          <span className="preview-value">{format}</span>
        </div>
      </div>
    </div>
  );
}




