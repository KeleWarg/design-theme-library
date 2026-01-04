/**
 * @chunk 3.10 - AIGenerationFlow
 * 
 * Result preview component for reviewing AI-generated code.
 * Includes code editor, props display, and action buttons.
 */

import { useState } from 'react';
import { Button, Textarea } from '../../ui';
import CodeEditor from '../../ui/CodeEditor';
import { 
  Check, 
  RefreshCw, 
  RotateCcw, 
  AlertTriangle, 
  Code, 
  Settings,
  Copy,
  CheckCheck
} from 'lucide-react';

/**
 * Result preview component
 * @param {Object} props
 * @param {string} props.code - Generated component code
 * @param {Function} props.onCodeChange - Code change handler
 * @param {Array} props.generatedProps - Extracted props from generated code
 * @param {Array} props.validationErrors - Code validation errors
 * @param {string} props.feedback - User feedback for regeneration
 * @param {Function} props.onFeedbackChange - Feedback change handler
 * @param {Function} props.onRegenerate - Regenerate button handler
 * @param {Function} props.onAccept - Accept button handler
 * @param {Function} props.onStartOver - Start over button handler
 * @param {boolean} props.isRegenerating - Whether regeneration is in progress
 */
export default function ResultPreview({
  code,
  onCodeChange,
  generatedProps = [],
  validationErrors = [],
  feedback,
  onFeedbackChange,
  onRegenerate,
  onAccept,
  onStartOver,
  isRegenerating = false
}) {
  const [activeTab, setActiveTab] = useState('code');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="result-preview">
      <div className="result-preview-header">
        <h2 className="result-preview-title">Review Generated Component</h2>
        {validationErrors.length > 0 && (
          <div className="result-preview-warnings">
            <AlertTriangle size={16} />
            <span>{validationErrors.length} warning{validationErrors.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="result-preview-tabs">
        <button
          type="button"
          className={`result-preview-tab ${activeTab === 'code' ? 'result-preview-tab--active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          <Code size={16} />
          <span>Code</span>
        </button>
        <button
          type="button"
          className={`result-preview-tab ${activeTab === 'props' ? 'result-preview-tab--active' : ''}`}
          onClick={() => setActiveTab('props')}
        >
          <Settings size={16} />
          <span>Props ({generatedProps.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="result-preview-content">
        {activeTab === 'code' && (
          <div className="result-preview-code">
            <div className="result-preview-code-header">
              <span className="result-preview-code-lang">JSX</span>
              <button
                type="button"
                className="result-preview-copy-btn"
                onClick={handleCopyCode}
                title="Copy code"
              >
                {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <CodeEditor
              value={code}
              onChange={onCodeChange}
              language="jsx"
            />
          </div>
        )}

        {activeTab === 'props' && (
          <div className="result-preview-props">
            {generatedProps.length > 0 ? (
              <table className="result-preview-props-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Default</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedProps.map((prop, index) => (
                    <tr key={index}>
                      <td className="result-preview-prop-name">
                        <code>{prop.name}</code>
                      </td>
                      <td>
                        <span className="result-preview-prop-type">{prop.type}</span>
                      </td>
                      <td>
                        {prop.required ? (
                          <span className="result-preview-prop-required">Yes</span>
                        ) : (
                          <span className="result-preview-prop-optional">No</span>
                        )}
                      </td>
                      <td>
                        {prop.default !== undefined ? (
                          <code className="result-preview-prop-default">{String(prop.default)}</code>
                        ) : (
                          <span className="result-preview-prop-none">—</span>
                        )}
                      </td>
                      <td className="result-preview-prop-description">
                        {prop.description || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="result-preview-props-empty">
                <Settings size={24} />
                <p>No props detected in generated code</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Warnings */}
      {validationErrors.length > 0 && (
        <div className="result-preview-validation">
          <div className="result-preview-validation-header">
            <AlertTriangle size={16} />
            <span>Validation Warnings</span>
          </div>
          <ul className="result-preview-validation-list">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback Section */}
      <div className="result-preview-feedback">
        <Textarea
          label="Feedback for regeneration (optional)"
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="e.g., Make the hover state more subtle, add a loading state, change the icon position..."
          rows={3}
        />
        <Button
          variant="secondary"
          onClick={onRegenerate}
          disabled={!feedback.trim() || isRegenerating}
          loading={isRegenerating}
        >
          <RefreshCw size={16} />
          Regenerate with Feedback
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="result-preview-actions">
        <Button variant="ghost" onClick={onStartOver}>
          <RotateCcw size={16} />
          Start Over
        </Button>
        <Button onClick={onAccept}>
          <Check size={16} />
          Accept & Create
        </Button>
      </div>
    </div>
  );
}


