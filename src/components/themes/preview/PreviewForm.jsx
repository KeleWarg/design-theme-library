/**
 * @chunk 2.27 - Preview Components
 * 
 * Form elements preview section showing inputs, selects, etc.
 */

import { useState } from 'react';
import { Check, ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Preview form elements with theme styles applied
 */
export default function PreviewForm() {
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [radioValue, setRadioValue] = useState('option1');

  return (
    <div className="preview-form-container">
      {/* Text inputs */}
      <div className="preview-form-group">
        <label 
          className="preview-form-label"
          style={{
            fontSize: 'var(--font-size-sm, 14px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-foreground, #1a1a1a)',
            marginBottom: 'var(--spacing-xs, 4px)',
            display: 'block',
          }}
        >
          Text Input
        </label>
        <input
          type="text"
          placeholder="Enter text..."
          className="preview-form-input"
          style={{
            width: '100%',
            padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
            fontSize: 'var(--font-size-sm, 14px)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: 'var(--radius-md, 6px)',
            backgroundColor: 'var(--color-background, #ffffff)',
            color: 'var(--color-foreground, #1a1a1a)',
          }}
        />
      </div>

      {/* Input with error */}
      <div className="preview-form-group">
        <label 
          className="preview-form-label"
          style={{
            fontSize: 'var(--font-size-sm, 14px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-foreground, #1a1a1a)',
            marginBottom: 'var(--spacing-xs, 4px)',
            display: 'block',
          }}
        >
          With Error
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            defaultValue="Invalid value"
            className="preview-form-input preview-form-input-error"
            style={{
              width: '100%',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              paddingRight: '36px',
              fontSize: 'var(--font-size-sm, 14px)',
              border: '1px solid var(--color-error, #ef4444)',
              borderRadius: 'var(--radius-md, 6px)',
              backgroundColor: 'var(--color-background, #ffffff)',
              color: 'var(--color-foreground, #1a1a1a)',
            }}
          />
          <AlertCircle 
            size={16} 
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-error, #ef4444)',
            }}
          />
        </div>
        <span 
          style={{
            fontSize: 'var(--font-size-xs, 12px)',
            color: 'var(--color-error, #ef4444)',
            marginTop: 'var(--spacing-xs, 4px)',
            display: 'block',
          }}
        >
          This field is required
        </span>
      </div>

      {/* Select */}
      <div className="preview-form-group">
        <label 
          className="preview-form-label"
          style={{
            fontSize: 'var(--font-size-sm, 14px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-foreground, #1a1a1a)',
            marginBottom: 'var(--spacing-xs, 4px)',
            display: 'block',
          }}
        >
          Select
        </label>
        <div style={{ position: 'relative' }}>
          <select
            className="preview-form-select"
            style={{
              width: '100%',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              paddingRight: '36px',
              fontSize: 'var(--font-size-sm, 14px)',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: 'var(--radius-md, 6px)',
              backgroundColor: 'var(--color-background, #ffffff)',
              color: 'var(--color-foreground, #1a1a1a)',
              appearance: 'none',
              cursor: 'pointer',
            }}
          >
            <option>Select an option</option>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
          <ChevronDown 
            size={16} 
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-muted-foreground, #6b7280)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Textarea */}
      <div className="preview-form-group">
        <label 
          className="preview-form-label"
          style={{
            fontSize: 'var(--font-size-sm, 14px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-foreground, #1a1a1a)',
            marginBottom: 'var(--spacing-xs, 4px)',
            display: 'block',
          }}
        >
          Textarea
        </label>
        <textarea
          placeholder="Enter longer text..."
          rows={3}
          className="preview-form-textarea"
          style={{
            width: '100%',
            padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
            fontSize: 'var(--font-size-sm, 14px)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: 'var(--radius-md, 6px)',
            backgroundColor: 'var(--color-background, #ffffff)',
            color: 'var(--color-foreground, #1a1a1a)',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Checkbox and Radio */}
      <div className="preview-form-row" style={{ display: 'flex', gap: 'var(--spacing-lg, 24px)' }}>
        {/* Checkbox */}
        <div className="preview-form-group" style={{ flex: 1 }}>
          <span 
            style={{
              fontSize: 'var(--font-size-sm, 14px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-foreground, #1a1a1a)',
              marginBottom: 'var(--spacing-sm, 8px)',
              display: 'block',
            }}
          >
            Checkbox
          </span>
          <label 
            className="preview-checkbox-label"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm, 8px)',
              cursor: 'pointer',
            }}
          >
            <div
              onClick={() => setCheckboxChecked(!checkboxChecked)}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: 'var(--radius-sm, 4px)',
                border: checkboxChecked 
                  ? 'none' 
                  : '2px solid var(--color-border, #d1d5db)',
                backgroundColor: checkboxChecked 
                  ? 'var(--color-primary, #3b82f6)' 
                  : 'var(--color-background, #ffffff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {checkboxChecked && <Check size={12} color="#fff" strokeWidth={3} />}
            </div>
            <span style={{ fontSize: 'var(--font-size-sm, 14px)', color: 'var(--color-foreground, #1a1a1a)' }}>
              Checked option
            </span>
          </label>
        </div>

        {/* Radio */}
        <div className="preview-form-group" style={{ flex: 1 }}>
          <span 
            style={{
              fontSize: 'var(--font-size-sm, 14px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-foreground, #1a1a1a)',
              marginBottom: 'var(--spacing-sm, 8px)',
              display: 'block',
            }}
          >
            Radio
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs, 4px)' }}>
            {['option1', 'option2'].map((option) => (
              <label 
                key={option}
                className="preview-radio-label"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm, 8px)',
                  cursor: 'pointer',
                }}
              >
                <div
                  onClick={() => setRadioValue(option)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: `2px solid ${radioValue === option ? 'var(--color-primary, #3b82f6)' : 'var(--color-border, #d1d5db)'}`,
                    backgroundColor: 'var(--color-background, #ffffff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {radioValue === option && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary, #3b82f6)',
                      }}
                    />
                  )}
                </div>
                <span style={{ fontSize: 'var(--font-size-sm, 14px)', color: 'var(--color-foreground, #1a1a1a)' }}>
                  {option === 'option1' ? 'Option One' : 'Option Two'}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Disabled state */}
      <div className="preview-form-group">
        <label 
          className="preview-form-label"
          style={{
            fontSize: 'var(--font-size-sm, 14px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-muted-foreground, #6b7280)',
            marginBottom: 'var(--spacing-xs, 4px)',
            display: 'block',
          }}
        >
          Disabled Input
        </label>
        <input
          type="text"
          disabled
          placeholder="Cannot edit"
          className="preview-form-input preview-form-input-disabled"
          style={{
            width: '100%',
            padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
            fontSize: 'var(--font-size-sm, 14px)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: 'var(--radius-md, 6px)',
            backgroundColor: 'var(--color-muted, #f5f5f5)',
            color: 'var(--color-muted-foreground, #6b7280)',
            cursor: 'not-allowed',
          }}
        />
      </div>
    </div>
  );
}

