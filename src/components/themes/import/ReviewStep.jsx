/**
 * @chunk 2.10 - ReviewStep
 * 
 * Final review step before importing tokens to database.
 * Shows token summary by category, CSS preview, and theme name input.
 */

import { useState, useMemo } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { themeService } from '../../../services/themeService';
import { tokenService } from '../../../services/tokenService';
import { tokenToCssValue } from '../../../lib/cssVariableInjector';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';

const CATEGORY_LABELS = {
  color: 'Color',
  typography: 'Typography',
  spacing: 'Spacing',
  shadow: 'Shadow',
  radius: 'Radius',
  grid: 'Grid',
  other: 'Other'
};

export default function ReviewStep({ data, onUpdate, onNext, onBack }) {
  const [themeName, setThemeName] = useState(data.themeName || 'Imported Theme');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);

  /**
   * Calculate token counts by category
   */
  const categoryCounts = useMemo(() => {
    const counts = {};
    data.parsedTokens.forEach(token => {
      const cat = data.mappings[token.path] || token.category;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [data.parsedTokens, data.mappings]);

  /**
   * Generate CSS preview from first 5 tokens
   */
  const cssPreview = useMemo(() => {
    return data.parsedTokens.slice(0, 5).map(token => {
      try {
        return `${token.css_variable}: ${tokenToCssValue(token)};`;
      } catch {
        return `${token.css_variable}: /* error */;`;
      }
    }).join('\n');
  }, [data.parsedTokens]);

  /**
   * Handle theme import
   */
  const handleImport = async () => {
    if (!themeName.trim()) return;
    
    setIsImporting(true);
    setImportError(null);
    
    try {
      // Create theme if not already created
      let themeId = data.themeId;
      if (!themeId) {
        const theme = await themeService.createTheme({
          name: themeName.trim(),
          source: 'import'
        });
        themeId = theme.id;
      } else {
        // Update theme name if changed
        await themeService.updateTheme(themeId, { name: themeName.trim() });
      }

      // Prepare tokens with final mappings
      const tokensToImport = data.parsedTokens.map(token => ({
        name: token.name,
        path: token.path,
        category: data.mappings[token.path] || token.category,
        type: token.type,
        value: token.value,
        css_variable: token.css_variable,
        description: token.description
      }));

      // Bulk create tokens
      await tokenService.bulkCreateTokens(themeId, tokensToImport);

      onUpdate({ themeId, themeName: themeName.trim() });
      toast.success(`Imported ${tokensToImport.length} tokens successfully!`);
      onNext();
    } catch (error) {
      const errorMessage = error.message || 'Failed to import tokens';
      setImportError(errorMessage);
      toast.error('Failed to import tokens: ' + errorMessage);
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const totalTokens = data.parsedTokens.length;
  const isValid = themeName.trim().length > 0;

  return (
    <div className="review-step">
      {/* Summary Header */}
      <div className="review-header">
        <CheckCircle size={24} className="review-header__icon" />
        <div className="review-header__text">
          <h3 className="review-header__title">Ready to Import</h3>
          <p className="review-header__subtitle">
            Review your import settings before proceeding
          </p>
        </div>
      </div>

      {/* Theme Name Input */}
      <div className="summary-card">
        <h4 className="summary-card__title">Theme Name</h4>
        <Input
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          maxLength={50}
          placeholder="Enter theme name..."
          required
          error={!isValid && themeName.length > 0 ? 'Theme name is required' : null}
        />
        <p className="summary-card__hint">
          This name will identify your theme in the dashboard
        </p>
      </div>

      {/* Token Summary */}
      <div className="summary-card">
        <h4 className="summary-card__title">Token Summary</h4>
        <div className="summary-grid">
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <div key={cat} className="summary-item">
              <span className={cn('category-dot', `category-dot--${cat}`)} />
              <span className="summary-item__name">
                {CATEGORY_LABELS[cat] || cat}
              </span>
              <span className="summary-item__count">{count}</span>
            </div>
          ))}
        </div>
        <div className="summary-total">
          <span className="summary-total__label">Total</span>
          <span className="summary-total__count">{totalTokens} tokens</span>
        </div>
      </div>

      {/* CSS Preview */}
      <div className="summary-card">
        <h4 className="summary-card__title">CSS Variables Preview</h4>
        <pre className="css-preview">
          <code>
            {cssPreview}
            {totalTokens > 5 && (
              <span className="css-preview__more">
                {`\n/* ... and ${totalTokens - 5} more */`}
              </span>
            )}
          </code>
        </pre>
      </div>

      {/* Import Error */}
      {importError && (
        <div className="import-error">
          <AlertCircle size={16} />
          <span>{importError}</span>
        </div>
      )}

      {/* Navigation Actions */}
      <div className="step-actions">
        <Button variant="ghost" onClick={onBack} disabled={isImporting}>
          Back
        </Button>
        <Button 
          onClick={handleImport} 
          loading={isImporting}
          disabled={!isValid}
        >
          Import {totalTokens} Tokens
        </Button>
      </div>
    </div>
  );
}

