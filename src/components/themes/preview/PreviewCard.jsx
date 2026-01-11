/**
 * @chunk 2.27 - Preview Components
 * 
 * Card preview section showing card component variants using
 * the theme's actual tokens.
 */

import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

/**
 * Extract color value from token
 */
function getColorValue(token) {
  if (!token) return null;
  const { value } = token;
  if (typeof value === 'string') return value;
  if (value?.hex) return value.hex;
  return null;
}

/**
 * Extract dimension value from token
 */
function getDimensionValue(token, defaultValue) {
  if (!token) return defaultValue;
  const { value } = token;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `${value}px`;
  if (value?.value !== undefined) return `${value.value}${value.unit || 'px'}`;
  return defaultValue;
}

/**
 * Preview card variants with theme styles applied
 */
export default function PreviewCard({ theme }) {
  const tokens = theme?.tokens || [];
  
  // Find tokens by css_variable
  const findToken = (cssVar) => tokens.find(t => t.css_variable === cssVar);
  
  // Background colors
  const bgWhite = getColorValue(findToken('--background-white')) || 'var(--background-white, transparent)';
  const bgNeutralSubtle = getColorValue(findToken('--background-neutral-subtle')) || 'var(--background-neutral-subtle, var(--background-muted, transparent))';
  const bgBrand = getColorValue(findToken('--background-brand')) || 
                  getColorValue(findToken('--background-button')) || 'var(--background-brand, var(--background-button, transparent))';
  
  // Foreground colors
  const fgHeading = getColorValue(findToken('--foreground-heading')) || 'var(--foreground-heading, var(--foreground-body, currentColor))';
  const fgBody = getColorValue(findToken('--foreground-body')) || 'var(--foreground-body, currentColor)';
  const fgCaption = getColorValue(findToken('--foreground-caption')) || 'var(--foreground-caption, var(--foreground-muted, currentColor))';
  const fgStroke = getColorValue(findToken('--foreground-stroke-default')) || 
                   getColorValue(findToken('--foreground-divider')) || 'var(--foreground-stroke-default, currentColor)';
  
  // Radius tokens
  const radiusMd = getDimensionValue(findToken('--radius-md'), '6px');
  const radiusLg = getDimensionValue(findToken('--radius-lg'), '8px');
  const radiusXl = getDimensionValue(findToken('--radius-xl'), '12px');
  
  // Shadow tokens (use fallback if not defined)
  const shadowSm = '0 1px 2px rgba(0,0,0,0.05)';
  const shadowMd = '0 4px 6px rgba(0,0,0,0.1)';
  const shadowLg = '0 10px 15px rgba(0,0,0,0.1)';

  return (
    <div className="preview-cards-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Basic card */}
      <div 
        className="preview-card"
        style={{
          backgroundColor: bgWhite,
          border: `1px solid ${fgStroke}`,
          borderRadius: radiusLg,
          boxShadow: shadowSm,
          padding: '16px',
        }}
      >
        <h4 
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: fgHeading,
            marginBottom: '4px',
            margin: 0,
          }}
        >
          Card Title
        </h4>
        <p 
          style={{
            fontSize: '14px',
            color: fgCaption,
            lineHeight: 1.625,
            margin: '8px 0 0 0',
          }}
        >
          This is a basic card component with title and description. It uses theme tokens for all styling.
        </p>
      </div>

      {/* Card with header and footer */}
      <div 
        className="preview-card preview-card-structured"
        style={{
          backgroundColor: bgWhite,
          border: `1px solid ${fgStroke}`,
          borderRadius: radiusLg,
          boxShadow: shadowMd,
          overflow: 'hidden',
        }}
      >
        <div 
          style={{
            padding: '16px',
            borderBottom: `1px solid ${fgStroke}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h4 
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: fgHeading,
                margin: 0,
              }}
            >
              Structured Card
            </h4>
            <span style={{ fontSize: '12px', color: fgCaption }}>
              With header and footer
            </span>
          </div>
          <button 
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px',
              borderRadius: '4px',
              color: fgCaption,
              cursor: 'pointer',
            }}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
        <div style={{ padding: '16px' }}>
          <p 
            style={{
              fontSize: '14px',
              color: fgBody,
              lineHeight: 1.625,
              margin: 0,
            }}
          >
            Card content goes here. This demonstrates a card with distinct header, body, and footer sections.
          </p>
        </div>
        <div 
          style={{
            padding: '8px 16px',
            borderTop: `1px solid ${fgStroke}`,
            backgroundColor: bgNeutralSubtle,
            display: 'flex',
            gap: '16px',
          }}
        >
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              padding: '4px',
              color: fgCaption,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <Heart size={16} /> 24
          </button>
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              padding: '4px',
              color: fgCaption,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <MessageCircle size={16} /> 8
          </button>
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              padding: '4px',
              color: fgCaption,
              fontSize: '14px',
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
          backgroundColor: bgWhite,
          borderRadius: radiusXl,
          boxShadow: shadowLg,
          padding: '24px',
        }}
      >
        <div 
          style={{
            width: '48px',
            height: '48px',
            borderRadius: radiusMd,
            backgroundColor: bgBrand,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <span style={{ color: 'var(--foreground-on-brand, var(--foreground-body-inverse, currentColor))', fontSize: '24px' }}>✨</span>
        </div>
        <h4 
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: fgHeading,
            marginBottom: '4px',
            margin: 0,
          }}
        >
          Elevated Card
        </h4>
        <p 
          style={{
            fontSize: '14px',
            color: fgCaption,
            lineHeight: 1.625,
            margin: '8px 0 16px 0',
          }}
        >
          A card with prominent shadow for emphasis.
        </p>
        <button
          style={{
            backgroundColor: bgBrand,
            color: 'var(--foreground-on-brand, var(--foreground-body-inverse, currentColor))',
            border: 'none',
            borderRadius: radiusMd,
            padding: '8px 16px',
            fontWeight: 500,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Learn More
        </button>
      </div>
    </div>
  );
}
