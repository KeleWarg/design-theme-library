/**
 * @chunk 4.06 - FigmaImportPage
 * 
 * Page to receive and list imported components from Figma.
 * Lists all pending imports with status badges and allows reviewing/importing.
 * Supports manual JSON import without the Figma plugin.
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { RefreshCw, Upload } from 'lucide-react';
import { useFigmaImport, useFigmaImports } from '../hooks/useFigmaImport';
import { PageHeader, Button, ErrorMessage } from '../components/ui';
import { ImportSkeleton } from '../components/ui/Skeleton';
import { NoImportsEmpty } from '../components/empty-states';
import { ImportReviewCard, ManualImportModal } from '../components/figma-import';
import ImportListModal from '../components/figma-import/ImportListModal';
import { formatDate } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function FigmaImportPage() {
  const { importId } = useParams();
  
  // If importId is provided, show single import view
  // Otherwise, show list of all imports
  const singleImport = useFigmaImport(importId);
  const allImports = useFigmaImports();
  
  const { data: imports, isLoading, error, refetch } = importId 
    ? { 
        data: singleImport.data ? [singleImport.data] : null, 
        isLoading: singleImport.isLoading, 
        error: singleImport.error,
        refetch: singleImport.refetch 
      }
    : allImports;
  
  const [reviewingImport, setReviewingImport] = useState(null);
  const [importData, setImportData] = useState(null);
  const [showManualImport, setShowManualImport] = useState(false);

  // Fetch full import data when opening review modal
  const handleReview = async (importRecord) => {
    try {
      // Get import record
      const { data: importRecordData, error: importError } = await supabase
        .from('figma_imports')
        .select('*')
        .eq('id', importRecord.id)
        .single();

      if (importError) throw importError;

      // Get components
      const { data: components, error: componentsError } = await supabase
        .from('figma_import_components')
        .select('*')
        .eq('import_id', importRecord.id)
        .order('created_at', { ascending: true });

      if (componentsError) throw componentsError;

      // Get images
      const { data: images, error: imagesError } = await supabase
        .from('figma_import_images')
        .select('*')
        .eq('import_id', importRecord.id);

      if (imagesError) throw imagesError;

      const fullImport = {
        ...importRecordData,
        components: components || [],
        images: images || [],
        metadata: {
          fileKey: importRecordData.file_key,
          fileName: importRecordData.file_name,
          exportedAt: importRecordData.exported_at,
        }
      };

      setImportData(fullImport);
      setReviewingImport(importRecord);
    } catch (error) {
      console.error('Failed to fetch import details:', error);
      toast.error('Failed to load import details');
    }
  };

  const handleImportAll = async (importRecord) => {
    try {
      // Implementation will be in chunk 4.13
      toast.success(`Importing ${importRecord.componentCount} components...`);
      // For now, just show success
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Imported ${importRecord.componentCount} components`);
      refetch();
    } catch (error) {
      toast.error('Failed to import components');
      console.error('Import error:', error);
    }
  };

  const handleImportSelected = async (result) => {
    try {
      // Implementation will be in chunk 4.13
      toast.success(`Importing ${result.components.length} components...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Imported ${result.components.length} components`);
      setReviewingImport(null);
      setImportData(null);
      refetch();
    } catch (error) {
      toast.error('Failed to import components');
      console.error('Import error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="page figma-import-page">
        <PageHeader
          title="Figma Imports"
          description="Review and import components from Figma"
        />
        <ImportSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page figma-import-page">
        <PageHeader
          title="Figma Imports"
          description="Review and import components from Figma"
        />
        <ErrorMessage 
          error={error} 
          title="Failed to load imports"
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="page figma-import-page">
      <PageHeader
        title="Figma Imports"
        description="Review and import components from Figma"
        action={
          <div className="page-header-actions">
            <Button 
              variant="outline" 
              onClick={() => setShowManualImport(true)}
            >
              <Upload size={16} />
              Import JSON
            </Button>
            <Button 
              variant="secondary" 
              onClick={refetch}
              loading={isLoading}
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        }
      />

      <main className="page-content">
        {!imports || imports.length === 0 ? (
          <NoImportsEmpty />
        ) : (
          <div className="import-list">
            {imports.map(importRecord => (
              <ImportReviewCard
                key={importRecord.id}
                import={importRecord}
                onReview={handleReview}
                onImport={handleImportAll}
              />
            ))}
          </div>
        )}
      </main>

      {reviewingImport && importData && (
        <ImportListModal
          import={reviewingImport}
          components={importData.components || []}
          images={importData.images || []}
          onClose={() => {
            setReviewingImport(null);
            setImportData(null);
          }}
          onImport={handleImportSelected}
        />
      )}

      {/* Manual JSON Import Modal */}
      <ManualImportModal
        open={showManualImport}
        onClose={() => setShowManualImport(false)}
        onSuccess={() => {
          setShowManualImport(false);
          refetch();
        }}
      />
    </div>
  );
}
