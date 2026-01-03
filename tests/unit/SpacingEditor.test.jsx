/**
 * @chunk 2.17 - SpacingEditor Tests
 * 
 * Unit tests for SpacingEditor component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SpacingEditor from '../../src/components/themes/editor/SpacingEditor';

describe('SpacingEditor', () => {
  const mockToken = {
    id: 'token-1',
    name: 'spacing-md',
    css_variable: '--spacing-md',
    value: { value: 16, unit: 'px' }
  };

  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with token', () => {
    render(<SpacingEditor token={mockToken} onUpdate={mockOnUpdate} />);
    
    // Check that value is displayed in preview
    expect(screen.getByText('16px')).toBeInTheDocument();
    
    // Check CSS variable is shown
    expect(screen.getByText('--spacing-md')).toBeInTheDocument();
    
    // Check labels
    expect(screen.getByText('Scale')).toBeInTheDocument();
    expect(screen.getByText('Visual Scale')).toBeInTheDocument();
  });

  it('loads token value correctly', () => {
    render(<SpacingEditor token={mockToken} onUpdate={mockOnUpdate} />);
    
    // Value input should have 16
    const valueInput = screen.getByLabelText('Value');
    expect(valueInput.value).toBe('16');
    
    // Unit should be px
    const unitSelect = screen.getByLabelText('Unit');
    expect(unitSelect.value).toBe('px');
  });

  it('handles string token values', () => {
    const stringToken = {
      ...mockToken,
      value: '24px'
    };
    
    render(<SpacingEditor token={stringToken} onUpdate={mockOnUpdate} />);
    
    const valueInput = screen.getByLabelText('Value');
    expect(valueInput.value).toBe('24');
  });

  it('handles number token values', () => {
    const numberToken = {
      ...mockToken,
      value: 32
    };
    
    render(<SpacingEditor token={numberToken} onUpdate={mockOnUpdate} />);
    
    const valueInput = screen.getByLabelText('Value');
    expect(valueInput.value).toBe('32');
  });

  it('value input updates correctly', () => {
    render(<SpacingEditor token={mockToken} onUpdate={mockOnUpdate} />);
    
    const valueInput = screen.getByLabelText('Value');
    fireEvent.change(valueInput, { target: { value: '24' } });
    
    expect(valueInput.value).toBe('24');
    
    // Trigger blur to save
    fireEvent.blur(valueInput);
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      value: { value: 24, unit: 'px' }
    });
  });

  it('unit change updates correctly', () => {
    render(<SpacingEditor token={mockToken} onUpdate={mockOnUpdate} />);
    
    const unitSelect = screen.getByLabelText('Unit');
    fireEvent.change(unitSelect, { target: { value: 'rem' } });
    
    // Wait for the setTimeout
    setTimeout(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        value: { value: 16, unit: 'rem' }
      });
    }, 10);
  });

  it('presets set correct value', () => {
    render(<SpacingEditor token={mockToken} onUpdate={mockOnUpdate} />);
    
    // Find the preset button for 24
    const preset24 = screen.getByRole('button', { name: '24' });
    fireEvent.click(preset24);
    
    // Wait for the setTimeout
    setTimeout(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        value: { value: 24, unit: 'px' }
      });
    }, 10);
  });

  it('preset buttons show active state', () => {
    render(<SpacingEditor token={mockToken} onUpdate={mockOnUpdate} />);
    
    // The 16 preset should be active (matches token value)
    const preset16 = screen.getByRole('button', { name: '16' });
    expect(preset16).toHaveClass('active');
    
    // Other presets should not be active
    const preset8 = screen.getByRole('button', { name: '8' });
    expect(preset8).not.toHaveClass('active');
  });

  it('visual preview updates with value', () => {
    const { rerender } = render(
      <SpacingEditor token={mockToken} onUpdate={mockOnUpdate} />
    );
    
    // Check initial preview label
    expect(screen.getByText('16px')).toBeInTheDocument();
    
    // Update with new token
    const newToken = {
      ...mockToken,
      id: 'token-2',
      value: { value: 32, unit: 'rem' }
    };
    
    rerender(<SpacingEditor token={newToken} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('32rem')).toBeInTheDocument();
  });

  it('renders all preset values', () => {
    render(<SpacingEditor token={mockToken} onUpdate={mockOnUpdate} />);
    
    const presets = [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];
    
    presets.forEach(preset => {
      expect(screen.getByRole('button', { name: String(preset) })).toBeInTheDocument();
    });
  });

  it('handles empty token gracefully', () => {
    render(<SpacingEditor token={{}} onUpdate={mockOnUpdate} />);
    
    // Should default to 16px
    const valueInput = screen.getByLabelText('Value');
    expect(valueInput.value).toBe('16');
  });

  it('handles null value gracefully', () => {
    const nullToken = {
      ...mockToken,
      value: null
    };
    
    render(<SpacingEditor token={nullToken} onUpdate={mockOnUpdate} />);
    
    // Should default to 16px
    const valueInput = screen.getByLabelText('Value');
    expect(valueInput.value).toBe('16');
  });
});

