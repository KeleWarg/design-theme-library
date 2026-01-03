/**
 * @chunk 2.13 - CategorySidebar
 * 
 * Unit tests for CategorySidebar component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategorySidebar from '../../src/components/themes/editor/CategorySidebar';

// Mock tokens for testing
const mockTokens = [
  { id: '1', name: 'primary', category: 'color', value: { hex: '#657E79' } },
  { id: '2', name: 'secondary', category: 'color', value: { hex: '#8B9D83' } },
  { id: '3', name: 'accent', category: 'color', value: { hex: '#D4A574' } },
  { id: '4', name: 'body', category: 'typography', value: { fontFamily: 'Inter' } },
  { id: '5', name: 'heading', category: 'typography', value: { fontFamily: 'Inter' } },
  { id: '6', name: 'sm', category: 'spacing', value: { value: '8px' } },
  { id: '7', name: 'md', category: 'spacing', value: { value: '16px' } },
  { id: '8', name: 'lg', category: 'spacing', value: { value: '24px' } },
  { id: '9', name: 'card', category: 'shadow', value: { value: '0 2px 4px rgba(0,0,0,0.1)' } },
  { id: '10', name: 'sm', category: 'radius', value: { value: '4px' } },
];

describe('CategorySidebar', () => {
  it('renders the Categories header', () => {
    render(
      <CategorySidebar 
        tokens={mockTokens} 
        activeCategory="color" 
        onCategoryChange={() => {}} 
      />
    );
    
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('renders all visible categories', () => {
    render(
      <CategorySidebar 
        tokens={mockTokens} 
        activeCategory="color" 
        onCategoryChange={() => {}} 
      />
    );
    
    // Should always show color, typography, spacing
    expect(screen.getByText('Colors')).toBeInTheDocument();
    expect(screen.getByText('Typography')).toBeInTheDocument();
    expect(screen.getByText('Spacing')).toBeInTheDocument();
    
    // Should show categories with tokens
    expect(screen.getByText('Shadows')).toBeInTheDocument();
    expect(screen.getByText('Radius')).toBeInTheDocument();
  });

  it('shows correct count for each category', () => {
    render(
      <CategorySidebar 
        tokens={mockTokens} 
        activeCategory="color" 
        onCategoryChange={() => {}} 
      />
    );
    
    // Color has 3 tokens
    const colorButton = screen.getByText('Colors').closest('button');
    expect(colorButton).toHaveTextContent('3');
    
    // Typography has 2 tokens
    const typographyButton = screen.getByText('Typography').closest('button');
    expect(typographyButton).toHaveTextContent('2');
    
    // Spacing has 3 tokens
    const spacingButton = screen.getByText('Spacing').closest('button');
    expect(spacingButton).toHaveTextContent('3');
    
    // Shadow has 1 token
    const shadowButton = screen.getByText('Shadows').closest('button');
    expect(shadowButton).toHaveTextContent('1');
    
    // Radius has 1 token
    const radiusButton = screen.getByText('Radius').closest('button');
    expect(radiusButton).toHaveTextContent('1');
  });

  it('active category is highlighted', () => {
    render(
      <CategorySidebar 
        tokens={mockTokens} 
        activeCategory="typography" 
        onCategoryChange={() => {}} 
      />
    );
    
    const typographyButton = screen.getByText('Typography').closest('button');
    expect(typographyButton).toHaveClass('active');
    
    // Other categories should not be active
    const colorButton = screen.getByText('Colors').closest('button');
    expect(colorButton).not.toHaveClass('active');
  });

  it('click changes active category', () => {
    const onCategoryChange = vi.fn();
    
    render(
      <CategorySidebar 
        tokens={mockTokens} 
        activeCategory="color" 
        onCategoryChange={onCategoryChange} 
      />
    );
    
    // Click on Typography
    fireEvent.click(screen.getByText('Typography'));
    expect(onCategoryChange).toHaveBeenCalledWith('typography');
    
    // Click on Spacing
    fireEvent.click(screen.getByText('Spacing'));
    expect(onCategoryChange).toHaveBeenCalledWith('spacing');
  });

  it('renders with empty tokens array', () => {
    render(
      <CategorySidebar 
        tokens={[]} 
        activeCategory="color" 
        onCategoryChange={() => {}} 
      />
    );
    
    // Should still show default categories (color, typography, spacing)
    expect(screen.getByText('Colors')).toBeInTheDocument();
    expect(screen.getByText('Typography')).toBeInTheDocument();
    expect(screen.getByText('Spacing')).toBeInTheDocument();
    
    // All counts should be 0
    const colorButton = screen.getByText('Colors').closest('button');
    expect(colorButton).toHaveTextContent('0');
  });

  it('renders with undefined tokens', () => {
    render(
      <CategorySidebar 
        tokens={undefined} 
        activeCategory="color" 
        onCategoryChange={() => {}} 
      />
    );
    
    // Should not crash and show default categories
    expect(screen.getByText('Colors')).toBeInTheDocument();
  });

  it('categorizes unknown categories as "other"', () => {
    const tokensWithUnknown = [
      ...mockTokens,
      { id: '11', name: 'custom', category: 'unknown-category', value: { value: 'test' } },
    ];
    
    render(
      <CategorySidebar 
        tokens={tokensWithUnknown} 
        activeCategory="color" 
        onCategoryChange={() => {}} 
      />
    );
    
    // "Other" category should appear and have count of 1
    expect(screen.getByText('Other')).toBeInTheDocument();
    const otherButton = screen.getByText('Other').closest('button');
    expect(otherButton).toHaveTextContent('1');
  });

  it('has proper aria-current attribute for active category', () => {
    render(
      <CategorySidebar 
        tokens={mockTokens} 
        activeCategory="spacing" 
        onCategoryChange={() => {}} 
      />
    );
    
    const spacingButton = screen.getByText('Spacing').closest('button');
    expect(spacingButton).toHaveAttribute('aria-current', 'true');
    
    const colorButton = screen.getByText('Colors').closest('button');
    expect(colorButton).not.toHaveAttribute('aria-current');
  });

  it('renders category icons', () => {
    render(
      <CategorySidebar 
        tokens={mockTokens} 
        activeCategory="color" 
        onCategoryChange={() => {}} 
      />
    );
    
    // Check that each button has an icon (svg element)
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });
});

