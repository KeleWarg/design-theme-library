/**
 * @chunk 5.03 - ComponentSelector
 * 
 * Unit tests for ComponentSelector component.
 * Tests multi-select, category filtering, and selection actions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComponentSelector from '../../src/components/export/ComponentSelector';
import { useComponents } from '../../src/hooks/useComponents';

// Mock useComponents hook
vi.mock('../../src/hooks/useComponents');

describe('ComponentSelector', () => {
  let mockOnChange;
  const mockComponents = [
    {
      id: '1',
      name: 'PrimaryButton',
      category: 'buttons',
      linked_tokens: ['color/primary', 'spacing/md']
    },
    {
      id: '2',
      name: 'TextInput',
      category: 'forms',
      linked_tokens: ['color/border']
    },
    {
      id: '3',
      name: 'Card',
      category: 'layout',
      linked_tokens: []
    },
    {
      id: '4',
      name: 'Modal',
      category: 'overlay',
      linked_tokens: ['color/background', 'spacing/lg', 'shadow/md']
    }
  ];

  beforeEach(() => {
    mockOnChange = vi.fn();
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading message when components are loading', () => {
      useComponents.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      render(<ComponentSelector selected={[]} onChange={mockOnChange} />);
      
      expect(screen.getByText('Loading components...')).toBeInTheDocument();
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      useComponents.mockReturnValue({
        data: mockComponents,
        isLoading: false,
        error: null
      });
    });

    it('renders all published components', () => {
      render(<ComponentSelector selected={[]} onChange={mockOnChange} />);
      
      expect(screen.getByText('PrimaryButton')).toBeInTheDocument();
      expect(screen.getByText('TextInput')).toBeInTheDocument();
      expect(screen.getByText('Card')).toBeInTheDocument();
      expect(screen.getByText('Modal')).toBeInTheDocument();
    });

    it('shows linked token count for each component', () => {
      render(<ComponentSelector selected={[]} onChange={mockOnChange} />);
      
      expect(screen.getByText('2 linked tokens')).toBeInTheDocument(); // PrimaryButton
      expect(screen.getByText('1 linked token')).toBeInTheDocument(); // TextInput
      expect(screen.getByText('0 linked tokens')).toBeInTheDocument(); // Card
      expect(screen.getByText('3 linked tokens')).toBeInTheDocument(); // Modal
    });

    it('renders category filter dropdown', () => {
      render(<ComponentSelector selected={[]} onChange={mockOnChange} />);
      
      const categorySelect = screen.getByRole('combobox');
      expect(categorySelect).toBeInTheDocument();
      expect(categorySelect.value).toBe('all');
    });

    it('renders select all and none buttons', () => {
      render(<ComponentSelector selected={[]} onChange={mockOnChange} />);
      
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('None')).toBeInTheDocument();
    });

    it('does not show selection summary when no components selected', () => {
      render(<ComponentSelector selected={[]} onChange={mockOnChange} />);
      
      expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    beforeEach(() => {
      useComponents.mockReturnValue({
        data: mockComponents,
        isLoading: false,
        error: null
      });
    });

    it('shows all components when category is "all"', () => {
      render(<ComponentSelector selected={[]} onChange={mockOnChange} />);
      
      expect(screen.getByText('PrimaryButton')).toBeInTheDocument();
      expect(screen.getByText('TextInput')).toBeInTheDocument();
      expect(screen.getByText('Card')).toBeInTheDocument();
      expect(screen.getByText('Modal')).toBeInTheDocument();
    });

    it('filters components by category', () => {
      render(<ComponentSelector selected={[]} onChange={mockOnChange} />);
      
      const categorySelect = screen.getByRole('combobox');
      fireEvent.change(categorySelect, { target: { value: 'buttons' } });
      
      expect(screen.getByText('PrimaryButton')).toBeInTheDocument();
      expect(screen.queryByText('TextInput')).not.toBeInTheDocument();
      expect(screen.queryByText('Card')).not.toBeInTheDocument();
      expect(screen.queryByText('Modal')).not.toBeInTheDocument();
    });

    it('shows empty state when no components in filtered category', () => {
      render(<ComponentSelector selected={[]} onChange={mockOnChange} />);
      
      const categorySelect = screen.getByRole('combobox');
      fireEvent.change(categorySelect, { target: { value: 'navigation' } });
      
      expect(screen.getByText('No published components in this category')).toBeInTheDocument();
    });
  });

  describe('Component Selection', () => {
    beforeEach(() => {
      useComponents.mockReturnValue({
        data: mockComponents,
        isLoading: false,
        error: null
      });
    });

    it('toggles component selection on checkbox click', () => {
      render(<ComponentSelector selected={[]} onChange={mockOnChange} />);
      
      const checkbox = screen.getByLabelText(/PrimaryButton/i).querySelector('input[type="checkbox"]');
      fireEvent.click(checkbox);
      
      expect(mockOnChange).toHaveBeenCalledWith(['1']);
    });

    it('deselects component when already selected', () => {
      render(<ComponentSelector selected={['1', '2']} onChange={mockOnChange} />);
      
      const checkbox = screen.getByLabelText(/PrimaryButton/i).querySelector('input[type="checkbox"]');
      fireEvent.click(checkbox);
      
      expect(mockOnChange).toHaveBeenCalledWith(['2']);
    });

    it('shows selected components as checked', () => {
      render(<ComponentSelector selected={['1', '3']} onChange={mockOnChange} />);
      
      const primaryButtonCheckbox = screen.getByLabelText(/PrimaryButton/i).querySelector('input[type="checkbox"]');
      const cardCheckbox = screen.getByLabelText(/Card/i).querySelector('input[type="checkbox"]');
      
      expect(primaryButtonCheckbox).toBeChecked();
      expect(cardCheckbox).toBeChecked();
    });
  });

  describe('Select All / None', () => {
    beforeEach(() => {
      useComponents.mockReturnValue({
        data: mockComponents,
        isLoading: false,
        error: null
      });
    });

    it('selects all components when "All" is clicked', () => {
      render(<ComponentSelector selected={[]} onChange={mockOnChange} />);
      
      fireEvent.click(screen.getByText('All'));
      
      expect(mockOnChange).toHaveBeenCalledWith(['1', '2', '3', '4']);
    });

    it('selects all filtered components when category is filtered', () => {
      render(<ComponentSelector selected={[]} onChange={mockOnChange} />);
      
      const categorySelect = screen.getByRole('combobox');
      fireEvent.change(categorySelect, { target: { value: 'buttons' } });
      
      fireEvent.click(screen.getByText('All'));
      
      expect(mockOnChange).toHaveBeenCalledWith(['1']);
    });

    it('deselects all components when "None" is clicked', () => {
      render(<ComponentSelector selected={['1', '2', '3']} onChange={mockOnChange} />);
      
      fireEvent.click(screen.getByText('None'));
      
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Selection Summary', () => {
    beforeEach(() => {
      useComponents.mockReturnValue({
        data: mockComponents,
        isLoading: false,
        error: null
      });
    });

    it('shows selection summary when components are selected', () => {
      render(<ComponentSelector selected={['1', '2']} onChange={mockOnChange} />);
      
      expect(screen.getByText('2 components selected')).toBeInTheDocument();
    });

    it('shows singular form for single selection', () => {
      render(<ComponentSelector selected={['1']} onChange={mockOnChange} />);
      
      expect(screen.getByText('1 component selected')).toBeInTheDocument();
    });
  });

  describe('useComponents Hook', () => {
    it('calls useComponents with published status filter', () => {
      useComponents.mockReturnValue({
        data: [],
        isLoading: false,
        error: null
      });

      render(<ComponentSelector selected={[]} onChange={mockOnChange} />);
      
      expect(useComponents).toHaveBeenCalledWith({ status: 'published' });
    });
  });
});

