/**
 * @chunk 2.11 - Import Integration
 * 
 * Success step shown after tokens are imported.
 * Provides navigation options to edit theme or return to themes list.
 */

import { useNavigate } from 'react-router-dom';
import { CheckCircle, Edit, ArrowLeft, Sparkles } from 'lucide-react';
import Button from '../../ui/Button';

export default function CompleteStep({ data }) {
  const navigate = useNavigate();

  const handleEditTheme = () => {
    navigate(`/themes/${data.themeId}`);
  };

  const handleBackToThemes = () => {
    navigate('/themes');
  };

  return (
    <div className="complete-step">
      {/* Success Animation */}
      <div className="success-animation">
        <div className="success-icon-wrapper">
          <CheckCircle className="success-icon" size={64} />
          <Sparkles className="success-sparkle success-sparkle--top" size={20} />
          <Sparkles className="success-sparkle success-sparkle--right" size={16} />
          <Sparkles className="success-sparkle success-sparkle--left" size={14} />
        </div>
      </div>
      
      {/* Success Message */}
      <div className="success-content">
        <h2 className="success-title">Import Complete!</h2>
        <p className="success-description">
          Successfully imported{' '}
          <strong className="success-highlight">{data.parsedTokens.length} tokens</strong>
          {' '}to{' '}
          <strong className="success-highlight">{data.themeName}</strong>
        </p>
      </div>

      {/* Import Summary */}
      <div className="import-summary">
        <div className="import-summary__item">
          <span className="import-summary__label">Theme</span>
          <span className="import-summary__value">{data.themeName}</span>
        </div>
        <div className="import-summary__item">
          <span className="import-summary__label">Tokens Imported</span>
          <span className="import-summary__value">{data.parsedTokens.length}</span>
        </div>
        {data.metadata?.format && (
          <div className="import-summary__item">
            <span className="import-summary__label">Source Format</span>
            <span className="import-summary__value">{data.metadata.format}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="next-actions">
        <Button onClick={handleEditTheme} className="next-actions__primary">
          <Edit size={16} />
          Edit Theme
        </Button>
        <Button variant="ghost" onClick={handleBackToThemes}>
          <ArrowLeft size={16} />
          Back to Themes
        </Button>
      </div>
    </div>
  );
}


