/**
 * @chunk 5.05 - CSS Export Generator Tests (services/generators)
 */

import { describe, it, expect } from 'vitest';
import { generateCSS } from '../../src/services/generators/cssGenerator';

describe('services/generators/cssGenerator', () => {
  it('expands composite typography tokens into -family/-size/-weight/-line-height/-letter-spacing vars (and does not emit the base var)', () => {
    const tokens = [
      {
        category: 'typography',
        type: 'typography-composite',
        path: 'typography/role/body-md',
        css_variable: '--typography-body-md',
        value: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '1rem',
          fontWeight: 400,
          lineHeight: '1.5',
          letterSpacing: 'normal',
        },
      },
    ];

    const css = generateCSS(tokens, { includeComments: false, includeHeader: false });

    expect(css).toContain('--typography-body-md-family: Inter, system-ui, sans-serif;');
    expect(css).toContain('--typography-body-md-size: 1rem;');
    expect(css).toContain('--typography-body-md-weight: 400;');
    expect(css).toContain('--typography-body-md-line-height: 1.5;');
    expect(css).toContain('--typography-body-md-letter-spacing: normal;');

    expect(css).not.toContain('--typography-body-md:');
  });
});




