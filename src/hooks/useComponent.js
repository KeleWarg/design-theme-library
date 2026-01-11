/**
 * @chunk 3.12 - ComponentDetail Layout
 * 
 * Hook for fetching a single component by ID.
 * Uses similar pattern to useComponents but for single component.
 */

import { useState, useEffect, useCallback } from 'react';
import { componentService } from '../services/componentService';

/**
 * Custom hook for fetching a single component
 * @param {string} id - Component UUID
 * @returns {Object} - { data, isLoading, error, mutate }
 */
export function useComponent(id) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComponent = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const component = await componentService.getComponent(id);
      setData(component);
    } catch (err) {
      console.error('Failed to fetch component:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComponent();
  }, [fetchComponent]);

  // Mutate function for manual refresh (similar to SWR pattern)
  const mutate = useCallback(() => {
    fetchComponent();
  }, [fetchComponent]);

  return {
    data,
    isLoading,
    error,
    mutate
  };
}

export default useComponent;




