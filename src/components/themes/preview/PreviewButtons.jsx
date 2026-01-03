/**
 * @chunk 2.27 - Preview Components
 * 
 * Button preview section showing button variants.
 */

/**
 * Preview button variants with theme styles applied
 */
export default function PreviewButtons() {
  return (
    <div className="preview-buttons-container">
      {/* Primary buttons */}
      <div className="preview-button-row">
        <span className="preview-button-label">Primary</span>
        <div className="preview-button-variants">
          <button 
            className="preview-btn preview-btn-primary"
            style={{
              backgroundColor: 'var(--color-primary, #3b82f6)',
              color: 'var(--color-primary-foreground, #ffffff)',
              borderRadius: 'var(--radius-md, 6px)',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontSize: 'var(--font-size-sm, 14px)',
            }}
          >
            Primary
          </button>
          <button 
            className="preview-btn preview-btn-primary preview-btn-hover"
            style={{
              backgroundColor: 'var(--color-primary-hover, #2563eb)',
              color: 'var(--color-primary-foreground, #ffffff)',
              borderRadius: 'var(--radius-md, 6px)',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontSize: 'var(--font-size-sm, 14px)',
            }}
          >
            Hover
          </button>
          <button 
            className="preview-btn preview-btn-primary preview-btn-disabled"
            disabled
            style={{
              backgroundColor: 'var(--color-primary, #3b82f6)',
              color: 'var(--color-primary-foreground, #ffffff)',
              borderRadius: 'var(--radius-md, 6px)',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontSize: 'var(--font-size-sm, 14px)',
              opacity: 0.5,
            }}
          >
            Disabled
          </button>
        </div>
      </div>

      {/* Secondary buttons */}
      <div className="preview-button-row">
        <span className="preview-button-label">Secondary</span>
        <div className="preview-button-variants">
          <button 
            className="preview-btn preview-btn-secondary"
            style={{
              backgroundColor: 'var(--color-secondary, #f3f4f6)',
              color: 'var(--color-secondary-foreground, #1f2937)',
              borderRadius: 'var(--radius-md, 6px)',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontSize: 'var(--font-size-sm, 14px)',
            }}
          >
            Secondary
          </button>
          <button 
            className="preview-btn preview-btn-secondary preview-btn-hover"
            style={{
              backgroundColor: 'var(--color-secondary-hover, #e5e7eb)',
              color: 'var(--color-secondary-foreground, #1f2937)',
              borderRadius: 'var(--radius-md, 6px)',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontSize: 'var(--font-size-sm, 14px)',
            }}
          >
            Hover
          </button>
        </div>
      </div>

      {/* Outline buttons */}
      <div className="preview-button-row">
        <span className="preview-button-label">Outline</span>
        <div className="preview-button-variants">
          <button 
            className="preview-btn preview-btn-outline"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-foreground, #1a1a1a)',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: 'var(--radius-md, 6px)',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontSize: 'var(--font-size-sm, 14px)',
            }}
          >
            Outline
          </button>
          <button 
            className="preview-btn preview-btn-outline preview-btn-hover"
            style={{
              backgroundColor: 'var(--color-muted, #f5f5f5)',
              color: 'var(--color-foreground, #1a1a1a)',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: 'var(--radius-md, 6px)',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontSize: 'var(--font-size-sm, 14px)',
            }}
          >
            Hover
          </button>
        </div>
      </div>

      {/* Ghost buttons */}
      <div className="preview-button-row">
        <span className="preview-button-label">Ghost</span>
        <div className="preview-button-variants">
          <button 
            className="preview-btn preview-btn-ghost"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-foreground, #1a1a1a)',
              borderRadius: 'var(--radius-md, 6px)',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontSize: 'var(--font-size-sm, 14px)',
            }}
          >
            Ghost
          </button>
          <button 
            className="preview-btn preview-btn-ghost preview-btn-hover"
            style={{
              backgroundColor: 'var(--color-muted, #f5f5f5)',
              color: 'var(--color-foreground, #1a1a1a)',
              borderRadius: 'var(--radius-md, 6px)',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontSize: 'var(--font-size-sm, 14px)',
            }}
          >
            Hover
          </button>
        </div>
      </div>

      {/* Destructive buttons */}
      <div className="preview-button-row">
        <span className="preview-button-label">Destructive</span>
        <div className="preview-button-variants">
          <button 
            className="preview-btn preview-btn-destructive"
            style={{
              backgroundColor: 'var(--color-error, #ef4444)',
              color: 'var(--color-error-foreground, #ffffff)',
              borderRadius: 'var(--radius-md, 6px)',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontSize: 'var(--font-size-sm, 14px)',
            }}
          >
            Delete
          </button>
          <button 
            className="preview-btn preview-btn-destructive-outline"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-error, #ef4444)',
              border: '1px solid var(--color-error, #ef4444)',
              borderRadius: 'var(--radius-md, 6px)',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontSize: 'var(--font-size-sm, 14px)',
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Button sizes */}
      <div className="preview-button-row">
        <span className="preview-button-label">Sizes</span>
        <div className="preview-button-variants preview-button-sizes">
          <button 
            className="preview-btn preview-btn-primary preview-btn-sm"
            style={{
              backgroundColor: 'var(--color-primary, #3b82f6)',
              color: 'var(--color-primary-foreground, #ffffff)',
              borderRadius: 'var(--radius-sm, 4px)',
              padding: 'var(--spacing-xs, 4px) var(--spacing-sm, 8px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontSize: 'var(--font-size-xs, 12px)',
            }}
          >
            Small
          </button>
          <button 
            className="preview-btn preview-btn-primary preview-btn-md"
            style={{
              backgroundColor: 'var(--color-primary, #3b82f6)',
              color: 'var(--color-primary-foreground, #ffffff)',
              borderRadius: 'var(--radius-md, 6px)',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontSize: 'var(--font-size-sm, 14px)',
            }}
          >
            Medium
          </button>
          <button 
            className="preview-btn preview-btn-primary preview-btn-lg"
            style={{
              backgroundColor: 'var(--color-primary, #3b82f6)',
              color: 'var(--color-primary-foreground, #ffffff)',
              borderRadius: 'var(--radius-lg, 8px)',
              padding: 'var(--spacing-md, 16px) var(--spacing-lg, 24px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontSize: 'var(--font-size-base, 16px)',
            }}
          >
            Large
          </button>
        </div>
      </div>
    </div>
  );
}

