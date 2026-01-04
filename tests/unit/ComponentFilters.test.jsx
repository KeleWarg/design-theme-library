/**
 * @chunk 3.03 - ComponentFilters
 * 
 * Unit tests for ComponentFilters component.
 * Tests search input with debounce, status/category selects, and clear filters.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ComponentFilters, { 
  STATUS_OPTIONS, 
  CATEGORY_OPTIONS, 
  DEFAULT_FILTERS 
} from '../../src/components/components/ComponentFilters';

describe('ComponentFilters', () => {
  let mockOnChange;

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnChange = vi.fn();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const defaultFilters = {
    status: 'all',
    category: 'all',
    search: ''
  };

  describe('Rendering', () => {
    it('renders all status filter buttons', () => {
      render(<ComponentFilters filters={defaultFilters} onChange={mockOnChange} />);
      
      STATUS_OPTIONS.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    it('renders category select with all options', () => {
      render(<ComponentFilters filters={defaultFilters} onChange={mockOnChange} />);
      
      const categorySelect = screen.getByRole('combobox', { name: /filter by category/i });
      expect(categorySelect).toBeInTheDocument();
      
      CATEGORY_OPTIONS.forEach(option => {
        expect(screen.getByRole('option', { name: option.label })).toBeInTheDocument();
      });
    });

    it('renders search input', () => {
      render(<ComponentFilters filters={defaultFilters} onChange={mockOnChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search components...');
      expect(searchInput).toBeInTheDocument();
    });

    it('does not show clear filters button when no filters active', () => {
      render(<ComponentFilters filters={defaultFilters} onChange={mockOnChange} />);
      
      expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
    });
  });

  describe('Status Filter', () => {
    it('highlights active status filter', () => {
      const filters = { ...defaultFilters, status: 'draft' };
      render(<ComponentFilters filters={filters} onChange={mockOnChange} />);
      
      const draftButton = screen.getByText('Draft').closest('button');
      expect(draftButton).toHaveClass('filter-btn-active');
    });

    it('calls onChange when status filter is clicked', () => {
      render(<ComponentFilters filters={defaultFilters} onChange={mockOnChange} />);
      
      fireEvent.click(screen.getByText('Published'));
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        status: 'published'
      });
    });

    it('updates status correctly for all options', () => {
      render(<ComponentFilters filters={defaultFilters} onChange={mockOnChange} />);
      
      fireEvent.click(screen.getByText('Draft'));
      expect(mockOnChange).toHaveBeenCalledWith({ ...defaultFilters, status: 'draft' });
      
      mockOnChange.mockClear();
      fireEvent.click(screen.getByText('Archived'));
      expect(mockOnChange).toHaveBeenCalledWith({ ...defaultFilters, status: 'archived' });
    });
  });

  describe('Category Filter', () => {
    it('shows selected category value', () => {
      const filters = { ...defaultFilters, category: 'buttons' };
      render(<ComponentFilters filters={filters} onChange={mockOnChange} />);
      
      const categorySelect = screen.getByRole('combobox', { name: /filter by category/i });
      expect(categorySelect.value).toBe('buttons');
    });

    it('calls onChange when category is changed', () => {
      render(<ComponentFilters filters={defaultFilters} onChange={mockOnChange} />);
      
      const categorySelect = screen.getByRole('combobox', { name: /filter by category/i });
      fireEvent.change(categorySelect, { target: { value: 'forms' } });
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        category: 'forms'
      });
    });
  });

  describe('Search Input with Debounce', () => {
    it('updates search input value immediately', () => {
      render(<ComponentFilters filters={defaultFilters} onChange={mockOnChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search components...');
      fireEvent.change(searchInput, { target: { value: 'button' } });
      
      expect(searchInput.value).toBe('button');
    });

    it('debounces search filter updates', async () => {
      render(<ComponentFilters filters={defaultFilters} onChange={mockOnChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search components...');
      
      // Type in search
      fireEvent.change(searchInput, { target: { value: 'button' } });
      
      // onChange should not be called immediately
      expect(mockOnChange).not.toHaveBeenCalled();
      
      // Advance timers by debounce delay (300ms)
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      // Now onChange should be called with debounced value
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        search: 'button'
      });
    });

    it('only triggers one onChange for rapid typing', () => {
      render(<ComponentFilters filters={defaultFilters} onChange={mockOnChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search components...');
      
      // Rapid typing
      fireEvent.change(searchInput, { target: { value: 'b' } });
      act(() => { vi.advanceTimersByTime(100); });
      
      fireEvent.change(searchInput, { target: { value: 'bu' } });
      act(() => { vi.advanceTimersByTime(100); });
      
      fireEvent.change(searchInput, { target: { value: 'but' } });
      act(() => { vi.advanceTimersByTime(100); });
      
      fireEvent.change(searchInput, { target: { value: 'butt' } });
      
      // Not enough time passed
      expect(mockOnChange).not.toHaveBeenCalled();
      
      // Wait for full debounce
      act(() => { vi.advanceTimersByTime(300); });
      
      // Should only call onChange once with final value
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        search: 'butt'
      });
    });

    it('shows clear search button when search has value', () => {
      render(<ComponentFilters filters={defaultFilters} onChange={mockOnChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search components...');
      
      // Initially no clear button
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
      
      // Type something
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      // Clear button should appear
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('clears search immediately when clear button is clicked', () => {
      render(<ComponentFilters filters={defaultFilters} onChange={mockOnChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search components...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);
      
      // Input should be cleared immediately
      expect(searchInput.value).toBe('');
      
      // onChange should be called immediately (not debounced)
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        search: ''
      });
    });
  });

  describe('Clear Filters', () => {
    it('shows clear filters button when status is not "all"', () => {
      const filters = { ...defaultFilters, status: 'draft' };
      render(<ComponentFilters filters={filters} onChange={mockOnChange} />);
      
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('shows clear filters button when category is not "all"', () => {
      const filters = { ...defaultFilters, category: 'buttons' };
      render(<ComponentFilters filters={filters} onChange={mockOnChange} />);
      
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('shows clear filters button when search has value', () => {
      render(<ComponentFilters filters={defaultFilters} onChange={mockOnChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search components...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('resets all filters when clear filters is clicked', () => {
      const filters = { 
        status: 'published', 
        category: 'buttons', 
        search: 'test' 
      };
      render(<ComponentFilters filters={filters} onChange={mockOnChange} />);
      
      fireEvent.click(screen.getByText('Clear Filters'));
      
      expect(mockOnChange).toHaveBeenCalledWith(DEFAULT_FILTERS);
    });

    it('clears search input when clear filters is clicked', () => {
      render(<ComponentFilters filters={defaultFilters} onChange={mockOnChange} />);
      
      const searchInput = screen.getByPlaceholderText('Search components...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      fireEvent.click(screen.getByText('Clear Filters'));
      
      expect(searchInput.value).toBe('');
    });
  });

  describe('Exported Constants', () => {
    it('exports STATUS_OPTIONS with correct values', () => {
      expect(STATUS_OPTIONS).toHaveLength(4);
      expect(STATUS_OPTIONS.map(o => o.value)).toEqual(['all', 'draft', 'published', 'archived']);
    });

    it('exports CATEGORY_OPTIONS with correct values', () => {
      expect(CATEGORY_OPTIONS.length).toBeGreaterThan(0);
      expect(CATEGORY_OPTIONS[0]).toEqual({ value: 'all', label: 'All Categories' });
    });

    it('exports DEFAULT_FILTERS', () => {
      expect(DEFAULT_FILTERS).toEqual({
        status: 'all',
        category: 'all',
        search: ''
      });
    });
  });
});


