/**
 * @chunk 2.16 - TypographyEditor Tests
 * 
 * Unit tests for the TypographyEditor component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TypographyEditor from '../../src/components/themes/editor/TypographyEditor';

describe('TypographyEditor', () => {
  const mockToken = {
    id: 'test-token-1',
    name: 'font-size-body',
    path: 'typography/size/body',
    css_variable: '--font-size-body',
    value: { value: 16, unit: 'px' }
  };

  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  describe('Token Loading', () => {
    it('loads token value correctly', () => {
      render(<TypographyEditor token={mockToken} onUpdate={mockOnUpdate} />);
      
      const valueInput = screen.getByLabelText('Value');
      expect(valueInput.value).toBe('16');
    });

    it('loads token with object value format', () => {
      const tokenWithObjectValue = {
        ...mockToken,
        value: { value: 24, unit: 'rem' }
      };
      
      render(<TypographyEditor token={tokenWithObjectValue} onUpdate={mockOnUpdate} />);
      
      const valueInput = screen.getByLabelText('Value');
      expect(valueInput.value).toBe('24');
    });

    it('loads token with string value format', () => {
      const tokenWithStringValue = {
        ...mockToken,
        value: '18px'
      };
      
      render(<TypographyEditor token={tokenWithStringValue} onUpdate={mockOnUpdate} />);
      
      const valueInput = screen.getByLabelText('Value');
      expect(valueInput.value).toBe('18');
    });

    it('loads font-family string values without coercing to px', () => {
      const fontFamilyToken = {
        ...mockToken,
        name: 'font-family-body',
        path: 'typography/font-family/body',
        css_variable: '--font-family-body',
        value: 'Inter, sans-serif'
      };

      render(<TypographyEditor token={fontFamilyToken} onUpdate={mockOnUpdate} />);

      // Font-family tokens hide the numeric input and show the selected family
      expect(screen.queryByLabelText('Value')).not.toBeInTheDocument();
      const previewLabel = screen.getByText(/Inter, sans-serif/);
      expect(previewLabel).toBeInTheDocument();
    });

    it('loads token with number value format', () => {
      const tokenWithNumberValue = {
        ...mockToken,
        value: 20
      };
      
      render(<TypographyEditor token={tokenWithNumberValue} onUpdate={mockOnUpdate} />);
      
      const valueInput = screen.getByLabelText('Value');
      expect(valueInput.value).toBe('20');
    });

    it('defaults to 16px when value is missing', () => {
      const tokenWithoutValue = {
        ...mockToken,
        value: null
      };
      
      render(<TypographyEditor token={tokenWithoutValue} onUpdate={mockOnUpdate} />);
      
      const valueInput = screen.getByLabelText('Value');
      expect(valueInput.value).toBe('16');
    });
  });

  describe('Value Input Updates', () => {
    it('updates value when input changes', () => {
      render(<TypographyEditor token={mockToken} onUpdate={mockOnUpdate} />);
      
      const valueInput = screen.getByLabelText('Value');
      fireEvent.change(valueInput, { target: { value: '20' } });
      
      expect(valueInput.value).toBe('20');
    });

    it('calls onUpdate when input loses focus', async () => {
      render(<TypographyEditor token={mockToken} onUpdate={mockOnUpdate} />);
      
      const valueInput = screen.getByLabelText('Value');
      fireEvent.change(valueInput, { target: { value: '24' } });
      fireEvent.blur(valueInput);
      
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith({
          value: { value: 24, unit: 'px' }
        });
      });
    });
  });

  describe('Unit Select Updates', () => {
    it('updates unit when select changes', async () => {
      render(<TypographyEditor token={mockToken} onUpdate={mockOnUpdate} />);
      
      const unitSelect = screen.getByLabelText('Unit');
      fireEvent.change(unitSelect, { target: { value: 'rem' } });
      
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith({
          value: { value: 16, unit: 'rem' }
        });
      });
    });

    it('displays available unit options', () => {
      render(<TypographyEditor token={mockToken} onUpdate={mockOnUpdate} />);
      
      const unitSelect = screen.getByLabelText('Unit');
      expect(unitSelect).toBeInTheDocument();
      
      // Check that options are available
      const options = unitSelect.querySelectorAll('option');
      expect(options.length).toBeGreaterThan(1);
    });
  });

  describe('Preset Buttons', () => {
    it('sets correct value when preset is clicked', async () => {
      render(<TypographyEditor token={mockToken} onUpdate={mockOnUpdate} />);
      
      // Find and click a preset button (24)
      const presetButton = screen.getByRole('button', { name: '24' });
      fireEvent.click(presetButton);
      
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith({
          value: { value: 24, unit: 'px' }
        });
      });
    });

    it('highlights active preset', () => {
      render(<TypographyEditor token={mockToken} onUpdate={mockOnUpdate} />);
      
      // The preset matching the current value (16) should have 'active' class
      const presetButton = screen.getByRole('button', { name: '16' });
      expect(presetButton).toHaveClass('active');
    });
  });

  describe('Live Preview', () => {
    it('displays preview text', () => {
      render(<TypographyEditor token={mockToken} onUpdate={mockOnUpdate} />);
      
      expect(screen.getByText(/The quick brown fox/)).toBeInTheDocument();
    });

    it('updates preview style when value changes', () => {
      const { rerender } = render(<TypographyEditor token={mockToken} onUpdate={mockOnUpdate} />);
      
      const previewText = screen.getByText(/The quick brown fox/);
      expect(previewText).toHaveStyle({ fontSize: '16px' });
      
      // Change value
      const valueInput = screen.getByLabelText('Value');
      fireEvent.change(valueInput, { target: { value: '24' } });
      
      // Preview should update
      expect(previewText).toHaveStyle({ fontSize: '24px' });
    });
  });

  describe('CSS Output', () => {
    it('shows current CSS variable value', () => {
      render(<TypographyEditor token={mockToken} onUpdate={mockOnUpdate} />);
      
      expect(screen.getByText('--font-size-body')).toBeInTheDocument();
    });

    it('shows CSS output with value and unit', () => {
      render(<TypographyEditor token={mockToken} onUpdate={mockOnUpdate} />);
      
      expect(screen.getByText(/--font-size-body: 16px;/)).toBeInTheDocument();
    });
  });

  describe('Token Type Detection', () => {
    it('detects line-height token type', () => {
      const lineHeightToken = {
        ...mockToken,
        name: 'line-height-body',
        path: 'typography/line-height/body',
        css_variable: '--line-height-body',
        value: { value: 1.5, unit: 'px' }
      };
      
      render(<TypographyEditor token={lineHeightToken} onUpdate={mockOnUpdate} />);
      
      // Should show line-height specific presets (1, 1.25, 1.5, etc.)
      expect(screen.getByRole('button', { name: '1.5' })).toBeInTheDocument();
    });

    it('detects letter-spacing token type', () => {
      const letterSpacingToken = {
        ...mockToken,
        name: 'letter-spacing-tight',
        path: 'typography/letter-spacing/tight',
        css_variable: '--letter-spacing-tight',
        value: { value: -0.025, unit: 'em' }
      };

      render(<TypographyEditor token={letterSpacingToken} onUpdate={mockOnUpdate} />);

      // Should show letter-spacing specific presets (formatPresetValue adds + for non-negative)
      expect(screen.getByRole('button', { name: '+0' })).toBeInTheDocument();
    });

    it('detects font-weight token type', () => {
      const fontWeightToken = {
        ...mockToken,
        name: 'font-weight-bold',
        path: 'typography/weight/bold',
        css_variable: '--font-weight-bold',
        value: 700
      };
      
      render(<TypographyEditor token={fontWeightToken} onUpdate={mockOnUpdate} />);
      
      // Should show font-weight presets
      expect(screen.getByText('Bold')).toBeInTheDocument();
    });

    it('hides unit select for font-weight tokens', () => {
      const fontWeightToken = {
        ...mockToken,
        name: 'font-weight-medium',
        path: 'typography/weight/medium',
        css_variable: '--font-weight-medium',
        value: 500
      };
      
      render(<TypographyEditor token={fontWeightToken} onUpdate={mockOnUpdate} />);
      
      // Unit select should not be present for weight tokens
      expect(screen.queryByLabelText('Unit')).not.toBeInTheDocument();
    });
  });

  describe('Type Scale Visualization', () => {
    it('shows type scale for font-size tokens', () => {
      render(<TypographyEditor token={mockToken} onUpdate={mockOnUpdate} />);
      
      expect(screen.getByText('Type Scale')).toBeInTheDocument();
    });

    it('hides type scale for non-font-size tokens', () => {
      const lineHeightToken = {
        ...mockToken,
        name: 'line-height-body',
        path: 'typography/line-height/body',
        css_variable: '--line-height-body',
        value: { value: 1.5, unit: 'px' }
      };
      
      render(<TypographyEditor token={lineHeightToken} onUpdate={mockOnUpdate} />);
      
      expect(screen.queryByText('Type Scale')).not.toBeInTheDocument();
    });
  });
});


