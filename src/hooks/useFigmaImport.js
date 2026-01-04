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
      // Get import record using RPC to bypass schema cache
      const { data: imports, error: importError } = await supabase
        .rpc('get_figma_imports');

      if (importError) throw importError;
      
      const importRecord = imports?.find(i => i.id === importId);
      if (!importRecord) {
        throw new Error('Import not found');
      }

      // Get components using RPC
      const { data: components, error: componentsError } = await supabase
        .rpc('get_figma_import_components', { p_import_id: importId });

      if (componentsError) throw componentsError;

      // Get images using RPC
      const { data: images, error: imagesError } = await supabase
        .rpc('get_figma_import_images', { p_import_id: importId });

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
      // Use RPC function to bypass PostgREST schema cache issues
      const { data: imports, error: importsError } = await supabase
        .rpc('get_figma_imports');

      if (importsError) {
        // Check if this is a schema cache error - treat as empty state
        const errorMessage = importsError.message || '';
        if (errorMessage.includes('schema cache') || 
            errorMessage.includes('does not exist') ||
            importsError.code === 'PGRST202' ||
            importsError.code === '42883') {
          console.warn('Figma imports table not yet in schema cache, showing empty state');
          setData([]);
          return;
        }
        
        // Fallback to direct table query if RPC doesn't exist
        const { data: fallbackImports, error: fallbackError } = await supabase
          .from('figma_imports')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackError) {
          // Also handle schema cache error from direct query
          const fallbackMessage = fallbackError.message || '';
          if (fallbackMessage.includes('schema cache') || 
              fallbackMessage.includes('does not exist') ||
              fallbackError.code === 'PGRST204') {
            console.warn('Figma imports table not yet in schema cache, showing empty state');
            setData([]);
            return;
          }
          throw fallbackError;
        }
        
        setData((fallbackImports || []).map(importRecord => ({
          ...importRecord,
          componentCount: importRecord.component_count || 0,
          metadata: {
            fileKey: importRecord.file_key,
            fileName: importRecord.file_name,
            exportedAt: importRecord.exported_at,
          }
        })));
        return;
      }

      // For each import, get component count
      const importsWithCounts = await Promise.all(
        (imports || []).map(async (importRecord) => {
          const { data: components, error: countError } = await supabase
            .rpc('get_figma_import_components', { p_import_id: importRecord.id });

          if (countError) {
            console.error('Failed to count components:', countError);
          }

          return {
            ...importRecord,
            componentCount: components?.length || importRecord.component_count || 0,
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
      // One final check for schema cache errors
      const errMessage = err.message || '';
      if (errMessage.includes('schema cache') || errMessage.includes('does not exist')) {
        console.warn('Figma imports table not yet in schema cache, showing empty state');
        setData([]);
        return;
      }
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





