/**
 * @chunk 3.03 - ComponentFilters
 * 
 * Filter bar for the components page.
 * Includes status filter, category filter, search input with debounce,
 * and clear filters button when filters are active.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { FilterBar, FilterButton } from '../ui/FilterBar';
import Button from '../ui/Button';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'buttons', label: 'Buttons' },
  { value: 'forms', label: 'Forms' },
  { value: 'cards', label: 'Cards' },
  { value: 'modals', label: 'Modals' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'data-display', label: 'Data Display' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'layout', label: 'Layout' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'other', label: 'Other' }
];

const DEFAULT_FILTERS = {
  status: 'all',
  category: 'all',
  search: ''
};

const DEBOUNCE_DELAY = 300;

/**
 * Custom hook for debounced value
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ComponentFilters({ filters, onChange }) {
  // Local state for search input (immediate updates)
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY);
  const isInitialMount = useRef(true);

  // Update parent when debounced search changes
  useEffect(() => {
    // Skip on initial mount to avoid unnecessary callback
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Only update if the debounced value differs from current filter
    if (debouncedSearch !== filters.search) {
      onChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch, onChange, filters]);

  // Sync local search input when filters change externally (e.g., clear filters)
  useEffect(() => {
    if (filters.search !== searchInput && filters.search === '') {
      setSearchInput('');
    }
  }, [filters.search]);

  const handleStatusChange = useCallback((status) => {
    onChange({ ...filters, status });
  }, [filters, onChange]);

  const handleCategoryChange = useCallback((e) => {
    onChange({ ...filters, category: e.target.value });
  }, [filters, onChange]);

  const handleSearchChange = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    onChange({ ...filters, search: '' });
  }, [filters, onChange]);

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    onChange(DEFAULT_FILTERS);
  }, [onChange]);

  // Check if any filters are active
  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.category !== 'all' || 
    filters.search !== '' ||
    searchInput !== '';

  return (
    <div className="component-filters">
      <div className="component-filters-row">
        {/* Status Filter */}
        <FilterBar>
          {STATUS_OPTIONS.map(option => (
            <FilterButton
              key={option.value}
              active={filters.status === option.value}
              onClick={() => handleStatusChange(option.value)}
            >
              {option.label}
            </FilterButton>
          ))}
        </FilterBar>

        {/* Category Dropdown */}
        <select 
          className="component-filter-select"
          value={filters.category}
          onChange={handleCategoryChange}
          aria-label="Filter by category"
        >
          {CATEGORY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="small" 
            onClick={handleClearFilters}
            className="component-filters-clear"
          >
            <X size={14} />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Search Input with Debounce */}
      <div className="component-search">
        <Search size={16} className="component-search-icon" />
        <input
          type="text"
          placeholder="Search components..."
          value={searchInput}
          onChange={handleSearchChange}
          className="component-search-input"
          aria-label="Search components"
        />
        {searchInput && (
          <button
            type="button"
            className="component-search-clear"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// Export constants for use in parent components
export { STATUS_OPTIONS, CATEGORY_OPTIONS, DEFAULT_FILTERS };
