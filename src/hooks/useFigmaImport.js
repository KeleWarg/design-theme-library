/**
 * @chunk 4.06 - FigmaImportPage
 * 
 * Custom hook for fetching Figma import data.
 * Supports fetching a single import by ID or all pending imports.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook for fetching a single Figma import by ID
 * @param {string|null} importId - Import UUID (optional)
 * @returns {Object} - { data, isLoading, error, refetch }
 */
export function useFigmaImport(importId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImport = useCallback(async () => {
    if (!importId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get import record
      const { data: importRecord, error: importError } = await supabase
        .from('figma_imports')
        .select('*')
        .eq('id', importId)
        .single();

      if (importError) throw importError;

      // Get components
      const { data: components, error: componentsError } = await supabase
        .from('figma_import_components')
        .select('*')
        .eq('import_id', importId)
        .order('created_at', { ascending: true });

      if (componentsError) throw componentsError;

      // Get images
      const { data: images, error: imagesError } = await supabase
        .from('figma_import_images')
        .select('*')
        .eq('import_id', importId);

      if (imagesError) throw imagesError;

      setData({
        ...importRecord,
        components: components || [],
        images: images || [],
        metadata: {
          fileKey: importRecord.file_key,
          fileName: importRecord.file_name,
          exportedAt: importRecord.exported_at,
        }
      });
    } catch (err) {
      console.error('Failed to fetch Figma import:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [importId]);

  useEffect(() => {
    fetchImport();
  }, [fetchImport]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchImport
  };
}

/**
 * Hook for fetching all pending Figma imports
 * @returns {Object} - { data, isLoading, error, refetch }
 */
export function useFigmaImports() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: imports, error: importsError } = await supabase
        .from('figma_imports')
        .select('*')
        .order('created_at', { ascending: false });

      if (importsError) throw importsError;

      // For each import, get component count
      const importsWithCounts = await Promise.all(
        (imports || []).map(async (importRecord) => {
          const { count, error: countError } = await supabase
            .from('figma_import_components')
            .select('*', { count: 'exact', head: true })
            .eq('import_id', importRecord.id);

          if (countError) {
            console.error('Failed to count components:', countError);
          }

          return {
            ...importRecord,
            componentCount: count || 0,
            metadata: {
              fileKey: importRecord.file_key,
              fileName: importRecord.file_name,
              exportedAt: importRecord.exported_at,
            }
          };
        })
      );

      setData(importsWithCounts);
    } catch (err) {
      console.error('Failed to fetch Figma imports:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImports();
  }, [fetchImports]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchImports
  };
}

export default useFigmaImport;

