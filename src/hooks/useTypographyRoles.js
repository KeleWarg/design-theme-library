/**
 * @chunk 2.24 - TypographyRoleEditor
 * 
 * Custom hook for fetching typography roles for a theme.
 * Uses simple state management pattern consistent with useTypefaces.
 */

import { useState, useEffect, useCallback } from 'react';
import { typefaceService } from '../services/typefaceService';

/**
 * Hook for fetching typography roles for a specific theme
 * @param {string} themeId - Theme UUID
 * @returns {Object} - { data, isLoading, error, refetch, mutate }
 */
export function useTypographyRoles(themeId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    if (!themeId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const roles = await typefaceService.getTypographyRoles(themeId);
      setData(roles);
    } catch (err) {
      console.error('Failed to fetch typography roles:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [themeId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

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
    refetch: fetchRoles,
    mutate
  };
}

/**
 * Hook for fetching typography roles with resolved typeface information
 * @param {string} themeId - Theme UUID
 * @returns {Object} - { data, isLoading, error, refetch }
 */
export function useTypographyRolesWithTypefaces(themeId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    if (!themeId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const roles = await typefaceService.getTypographyRolesWithTypefaces(themeId);
      setData(roles);
    } catch (err) {
      console.error('Failed to fetch typography roles with typefaces:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [themeId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRoles
  };
}

export default useTypographyRoles;


