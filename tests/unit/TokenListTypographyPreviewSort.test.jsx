/**
 * @chunk 2.14 - TokenList Typography Preview Sorting Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import TokenList from '../../src/components/themes/editor/TokenList';

describe('TokenList (Typography preview)', () => {
  it('sorts composite typography tokens by fontSize (largest to smallest)', () => {
    const tokens = [
      {
        id: 't1',
        category: 'typography',
        type: 'typography-composite',
        name: 'Small',
        css_variable: '--typography-small',
        value: { fontSize: '0.875rem' }
      },
      {
        id: 't2',
        category: 'typography',
        type: 'typography-composite',
        name: 'Large',
        css_variable: '--typography-large',
        value: { fontSize: '2rem' }
      },
      {
        id: 't3',
        category: 'typography',
        type: 'typography-composite',
        name: 'Medium',
        css_variable: '--typography-medium',
        value: { fontSize: { value: 24, unit: 'px' } }
      },
    ];

    render(
      <TokenList
        tokens={tokens}
        category="typography"
        themeId="theme-1"
        selectedToken={null}
        onSelectToken={() => {}}
      />
    );

    const list = screen.getByRole('listbox', { name: /typography tokens/i });
    const options = Array.from(list.querySelectorAll('[role="option"]'));
    const renderedNames = options
      .map((opt) => opt.querySelector('.token-list-item-name')?.textContent)
      .filter(Boolean);

    // 2rem (32px) > 24px > 0.875rem (14px)
    expect(renderedNames).toEqual(['Large', 'Medium', 'Small']);
  });
});


