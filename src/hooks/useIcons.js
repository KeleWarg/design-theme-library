/**
 * @chunk B.4 - useIcons Hook
 * 
 * Custom hook for fetching and filtering icons.
 */

import { useState, useEffect, useCallback } from 'react';
import { iconService } from '../services/iconService';

/**
 * Hook for fetching icons with optional filtering
 * @param {Object} filters - Filter options
 * @returns {Object} - { data, isLoading, error, refetch }
 */
export function useIcons(filters = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIcons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const icons = await iconService.getIcons(filters);
      setData(icons);
    } catch (err) {
      console.error('Failed to fetch icons:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchIcons();
  }, [fetchIcons]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchIcons
  };
}

/**
 * Hook for fetching a single icon by ID
 * @param {string} id - Icon UUID
 * @returns {Object} - { data, isLoading, error, refetch }
 */
export function useIcon(id) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIcon = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const icon = await iconService.getIcon(id);
      setData(icon);
    } catch (err) {
      console.error('Failed to fetch icon:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIcon();
  }, [fetchIcon]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchIcon
  };
}

export default useIcons;

