/**
 * @chunk 2.01 - ThemesPage Layout
 * 
 * Custom hook for fetching and filtering themes.
 * Uses simple state management - can be upgraded to SWR/React Query later.
 */

import { useState, useEffect, useCallback } from 'react';
import { themeService } from '../services/themeService';

/**
 * Hook for fetching themes with optional filtering
 * @param {string} filter - Filter type: 'all', 'draft', or 'published'
 * @returns {Object} - { data, isLoading, error, refetch, mutate }
 */
export function useThemes(filter = 'all') {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchThemes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const themes = await themeService.getThemes();
      
      // Apply client-side filtering
      let filteredThemes = themes;
      if (filter !== 'all') {
        filteredThemes = themes.filter(t => t.status === filter);
      }
      
      setData(filteredThemes);
    } catch (err) {
      console.error('Failed to fetch themes:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  // Optimistic update helper for mutations
  const mutate = useCallback((updater) => {
    if (typeof updater === 'function') {
      setData(prev => updater(prev));
    } else {
      setData(updater);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchThemes,
    mutate
  };
}

/**
 * Hook for fetching a single theme by ID
 * @param {string} id - Theme UUID
 * @returns {Object} - { data, isLoading, error, refetch }
 */
export function useTheme(id) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTheme = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const theme = await themeService.getTheme(id);
      setData(theme);
    } catch (err) {
      console.error('Failed to fetch theme:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTheme
  };
}

export default useThemes;


