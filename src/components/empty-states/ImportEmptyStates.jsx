/**
 * @chunk 6.06 - Empty States
 * 
 * Import-related empty state components.
 */

import { Figma, Upload, ExternalLink, BookOpen } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';

export function NoImportsEmpty() {
  return (
    <EmptyState
      icon={Figma}
      title="No pending imports"
      description="Export components from Figma to see them here."
    >
      <div className="import-empty-instructions">
        <h4 className="instructions-title">How to import from Figma:</h4>
        <ol className="instructions-list">
          <li>
            <span className="step-number">1</span>
            <span>Install the Design System plugin in Figma</span>
          </li>
          <li>
            <span className="step-number">2</span>
            <span>Open your Figma file with components</span>
          </li>
          <li>
            <span className="step-number">3</span>
            <span>Run the plugin (Plugins → Design System Export)</span>
          </li>
          <li>
            <span className="step-number">4</span>
            <span>Select components to export</span>
          </li>
          <li>
            <span className="step-number">5</span>
            <span>Click "Export to Admin"</span>
          </li>
          <li>
            <span className="step-number">6</span>
            <span>Return here to review and import</span>
          </li>
        </ol>
        
        <div className="instructions-links">
          <a 
            href="/docs/figma-plugin.md" 
            target="_blank"
            rel="noopener noreferrer"
            className="instruction-link"
          >
            <BookOpen size={14} />
            View setup guide
          </a>
          <a 
            href="https://www.figma.com/community/plugin/design-system-export" 
            target="_blank"
            rel="noopener noreferrer"
            className="instruction-link"
          >
            <ExternalLink size={14} />
            Get Figma plugin
          </a>
        </div>
      </div>
    </EmptyState>
  );
}

export function NoFilesUploaded({ onUploadClick }) {
  return (
    <EmptyState
      icon={Upload}
      title="No files uploaded"
      description="Upload a JSON file containing your design tokens"
      action={
        onUploadClick && (
          <Button variant="ghost" onClick={onUploadClick}>
            <Upload size={16} />
            Upload File
          </Button>
        )
      }
    />
  );
}





