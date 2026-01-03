/**
 * @chunk 2.27 - Preview Components
 * 
 * Card preview section showing card component variants.
 */

import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

/**
 * Preview card variants with theme styles applied
 */
export default function PreviewCard() {
  return (
    <div className="preview-cards-container">
      {/* Basic card */}
      <div 
        className="preview-card"
        style={{
          backgroundColor: 'var(--color-background, #ffffff)',
          border: '1px solid var(--color-border, #e5e7eb)',
          borderRadius: 'var(--radius-lg, 8px)',
          boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
          padding: 'var(--spacing-md, 16px)',
        }}
      >
        <h4 
          className="preview-card-title"
          style={{
            fontSize: 'var(--font-size-lg, 18px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            color: 'var(--color-foreground, #1a1a1a)',
            marginBottom: 'var(--spacing-xs, 4px)',
          }}
        >
          Card Title
        </h4>
        <p 
          className="preview-card-description"
          style={{
            fontSize: 'var(--font-size-sm, 14px)',
            color: 'var(--color-muted-foreground, #6b7280)',
            lineHeight: 'var(--line-height-relaxed, 1.625)',
          }}
        >
          This is a basic card component with title and description. It uses theme tokens for all styling.
        </p>
      </div>

      {/* Card with header and footer */}
      <div 
        className="preview-card preview-card-structured"
        style={{
          backgroundColor: 'var(--color-background, #ffffff)',
          border: '1px solid var(--color-border, #e5e7eb)',
          borderRadius: 'var(--radius-lg, 8px)',
          boxShadow: 'var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1))',
          overflow: 'hidden',
        }}
      >
        <div 
          className="preview-card-header"
          style={{
            padding: 'var(--spacing-md, 16px)',
            borderBottom: '1px solid var(--color-border, #e5e7eb)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h4 
              style={{
                fontSize: 'var(--font-size-base, 16px)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-foreground, #1a1a1a)',
                margin: 0,
              }}
            >
              Structured Card
            </h4>
            <span 
              style={{
                fontSize: 'var(--font-size-xs, 12px)',
                color: 'var(--color-muted-foreground, #6b7280)',
              }}
            >
              With header and footer
            </span>
          </div>
          <button 
            style={{
              background: 'transparent',
              border: 'none',
              padding: 'var(--spacing-xs, 4px)',
              borderRadius: 'var(--radius-sm, 4px)',
              color: 'var(--color-muted-foreground, #6b7280)',
              cursor: 'pointer',
            }}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
        <div 
          className="preview-card-body"
          style={{
            padding: 'var(--spacing-md, 16px)',
          }}
        >
          <p 
            style={{
              fontSize: 'var(--font-size-sm, 14px)',
              color: 'var(--color-foreground, #1a1a1a)',
              lineHeight: 'var(--line-height-relaxed, 1.625)',
              margin: 0,
            }}
          >
            Card content goes here. This demonstrates a card with distinct header, body, and footer sections.
          </p>
        </div>
        <div 
          className="preview-card-footer"
          style={{
            padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
            borderTop: '1px solid var(--color-border, #e5e7eb)',
            backgroundColor: 'var(--color-muted, #f5f5f5)',
            display: 'flex',
            gap: 'var(--spacing-md, 16px)',
          }}
        >
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs, 4px)',
              background: 'transparent',
              border: 'none',
              padding: 'var(--spacing-xs, 4px)',
              color: 'var(--color-muted-foreground, #6b7280)',
              fontSize: 'var(--font-size-sm, 14px)',
              cursor: 'pointer',
            }}
          >
            <Heart size={16} /> 24
          </button>
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs, 4px)',
              background: 'transparent',
              border: 'none',
              padding: 'var(--spacing-xs, 4px)',
              color: 'var(--color-muted-foreground, #6b7280)',
              fontSize: 'var(--font-size-sm, 14px)',
              cursor: 'pointer',
            }}
          >
            <MessageCircle size={16} /> 8
          </button>
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs, 4px)',
              background: 'transparent',
              border: 'none',
              padding: 'var(--spacing-xs, 4px)',
              color: 'var(--color-muted-foreground, #6b7280)',
              fontSize: 'var(--font-size-sm, 14px)',
              cursor: 'pointer',
            }}
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Elevated card */}
      <div 
        className="preview-card preview-card-elevated"
        style={{
          backgroundColor: 'var(--color-background, #ffffff)',
          borderRadius: 'var(--radius-xl, 12px)',
          boxShadow: 'var(--shadow-lg, 0 10px 15px rgba(0,0,0,0.1))',
          padding: 'var(--spacing-lg, 24px)',
        }}
      >
        <div 
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md, 6px)',
            backgroundColor: 'var(--color-primary, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--spacing-md, 16px)',
          }}
        >
          <span style={{ color: '#fff', fontSize: '24px' }}>✨</span>
        </div>
        <h4 
          style={{
            fontSize: 'var(--font-size-lg, 18px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            color: 'var(--color-foreground, #1a1a1a)',
            marginBottom: 'var(--spacing-xs, 4px)',
          }}
        >
          Elevated Card
        </h4>
        <p 
          style={{
            fontSize: 'var(--font-size-sm, 14px)',
            color: 'var(--color-muted-foreground, #6b7280)',
            lineHeight: 'var(--line-height-relaxed, 1.625)',
            marginBottom: 'var(--spacing-md, 16px)',
          }}
        >
          A card with prominent shadow for emphasis.
        </p>
        <button
          style={{
            backgroundColor: 'var(--color-primary, #3b82f6)',
            color: 'var(--color-primary-foreground, #ffffff)',
            border: 'none',
            borderRadius: 'var(--radius-md, 6px)',
            padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            fontSize: 'var(--font-size-sm, 14px)',
            cursor: 'pointer',
          }}
        >
          Learn More
        </button>
      </div>
    </div>
  );
}

