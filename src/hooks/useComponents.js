/**
 * @chunk 3.01 - ComponentsPage Layout
 * 
 * Hook for fetching and managing components data.
 * Handles filtering, loading states, and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { componentService } from '../services/componentService';

/**
 * Custom hook for components data fetching with filters
 * @param {Object} filters - Filter options
 * @param {string} [filters.status] - Filter by status ('all' | 'draft' | 'published' | 'archived')
 * @param {string} [filters.category] - Filter by category ('all' or specific category)
 * @param {string} [filters.search] - Search term
 * @returns {Object} - { data, isLoading, error, refresh }
 */
export function useComponents(filters = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComponents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Transform 'all' filters to undefined for the service
      const serviceFilters = {
        status: filters.status === 'all' ? undefined : filters.status,
        category: filters.category === 'all' ? undefined : filters.category,
        search: filters.search || undefined
      };
      
      const components = await componentService.getComponents(serviceFilters);
      setData(components);
    } catch (err) {
      console.error('Failed to fetch components:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [filters.status, filters.category, filters.search]);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchComponents
  };
}

export default useComponents;


