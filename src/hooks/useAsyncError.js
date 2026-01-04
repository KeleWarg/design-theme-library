/**
 * @chunk 6.05 - Error States & Loading
 * 
 * Hook for handling async operations with error and loading states.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook for managing async operations with error and loading states
 * @returns {Object} - { error, isLoading, handleError, clearError, execute }
 */
export function useAsyncError() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleError = useCallback((error) => {
    console.error(error);
    setError(error);
    const message = error?.message || 'An error occurred';
    toast.error(message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(async (asyncFn) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return { error, isLoading, handleError, clearError, execute };
}





