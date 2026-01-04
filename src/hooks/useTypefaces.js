/**
 * @chunk 2.21 - TypefaceManager
 * 
 * Custom hook for fetching typefaces for a theme.
 * Uses simple state management pattern consistent with useThemes.
 */

import { useState, useEffect, useCallback } from 'react';
import { typefaceService } from '../services/typefaceService';

/**
 * Hook for fetching typefaces for a specific theme
 * @param {string} themeId - Theme UUID
 * @returns {Object} - { data, isLoading, error, refetch, mutate }
 */
export function useTypefaces(themeId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTypefaces = useCallback(async () => {
    if (!themeId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const typefaces = await typefaceService.getTypefacesByTheme(themeId);
      setData(typefaces);
    } catch (err) {
      console.error('Failed to fetch typefaces:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [themeId]);

  useEffect(() => {
    fetchTypefaces();
  }, [fetchTypefaces]);

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
    refetch: fetchTypefaces,
    mutate
  };
}

/**
 * Hook for fetching a single typeface by ID
 * @param {string} id - Typeface UUID
 * @returns {Object} - { data, isLoading, error, refetch }
 */
export function useTypeface(id) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTypeface = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const typeface = await typefaceService.getTypeface(id);
      setData(typeface);
    } catch (err) {
      console.error('Failed to fetch typeface:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTypeface();
  }, [fetchTypeface]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTypeface
  };
}

export default useTypefaces;


