import { describe, it, expect } from 'vitest';
import { coercePropValues, computePreviewPropDiagnostics } from '../../src/lib/previewPropUtils';

describe('previewPropUtils', () => {
  it('coerces boolean and number values based on prop defs', () => {
    const propDefs = [
      { name: 'disabled', type: 'boolean' },
      { name: 'count', type: 'number' },
      { name: 'label', type: 'string' },
    ];

    const values = {
      disabled: 'false',
      count: '12',
      label: 'Hello',
    };

    const coerced = coercePropValues(propDefs, values);
    expect(coerced.disabled).toBe(false);
    expect(coerced.count).toBe(12);
    expect(coerced.label).toBe('Hello');
  });

  it('flags unused props and detects prop spread heuristically', () => {
    const propDefs = [
      { name: 'variant', type: 'enum' },
      { name: 'size', type: 'enum' },
      { name: 'className', type: 'string' }, // ignored
    ];
    const used = new Set(['variant']);
    const code = `export default function X(props){ return <button {...props} /> }`;

    const diag = computePreviewPropDiagnostics({ propDefs, usedPropNames: used, code });
    expect(diag.hasPropsSpread).toBe(true);
    expect(diag.unusedPropNames).toEqual(['size']);
  });
});


