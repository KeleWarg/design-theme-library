/**
 * @chunk 4.06 - FigmaImportPage
 * 
 * Page to receive and list imported components from Figma.
 * Lists all pending imports with status badges and allows reviewing/importing.
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { RefreshCw, Figma } from 'lucide-react';
import { useFigmaImport, useFigmaImports } from '../hooks/useFigmaImport';
import { PageHeader, Button, EmptyState, ErrorMessage } from '../components/ui';
import { ImportSkeleton } from '../components/ui/Skeleton';
import { ImportReviewCard } from '../components/figma-import';
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
      toast.info(`Importing ${importRecord.componentCount} components...`);

      // Fetch all components for this import
      const { data: components, error: fetchError } = await supabase
        .from('figma_import_components')
        .select('*')
        .eq('import_id', importRecord.id);

      if (fetchError) throw fetchError;

      if (!components || components.length === 0) {
        toast.warning('No components to import');
        return;
      }

      // Import each component to the components table
      let successCount = 0;
      let failCount = 0;

      for (const comp of components) {
        try {
          const { error: insertError } = await supabase
            .from('components')
            .insert({
              name: comp.name,
              slug: comp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
              description: comp.description || `Imported from Figma: ${comp.figma_id}`,
              category: comp.category || 'other',
              figma_id: comp.figma_id,
              figma_structure: comp.structure,
              status: 'draft'
            });

          if (insertError) {
            failCount++;
            console.error(`Failed to import component ${comp.name}:`, insertError);
          } else {
            successCount++;
          }
        } catch (err) {
          failCount++;
          console.error(`Failed to import component ${comp.name}:`, err);
        }
      }

      // Update import record status
      await supabase
        .from('figma_imports')
        .update({ status: 'imported' })
        .eq('id', importRecord.id);

      if (failCount === 0) {
        toast.success(`Successfully imported ${successCount} components`);
      } else {
        toast.warning(`Imported ${successCount} components, ${failCount} failed`);
      }

      refetch();
    } catch (error) {
      toast.error('Failed to import components: ' + (error.message || 'Unknown error'));
      console.error('Import error:', error);
    }
  };

  const handleImportSelected = async (result) => {
    try {
      const { components: selectedComponents } = result;

      if (!selectedComponents || selectedComponents.length === 0) {
        toast.warning('No components selected');
        return;
      }

      toast.info(`Importing ${selectedComponents.length} components...`);

      let successCount = 0;
      let failCount = 0;

      for (const comp of selectedComponents) {
        try {
          const { error: insertError } = await supabase
            .from('components')
            .insert({
              name: comp.name,
              slug: comp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
              description: comp.description || `Imported from Figma: ${comp.figma_id}`,
              category: comp.category || 'other',
              figma_id: comp.figma_id,
              figma_structure: comp.structure,
              status: 'draft'
            });

          if (insertError) {
            failCount++;
            console.error(`Failed to import component ${comp.name}:`, insertError);
          } else {
            successCount++;
          }
        } catch (err) {
          failCount++;
          console.error(`Failed to import component ${comp.name}:`, err);
        }
      }

      // Update import record status if all components imported
      if (reviewingImport) {
        await supabase
          .from('figma_imports')
          .update({ status: 'imported' })
          .eq('id', reviewingImport.id);
      }

      if (failCount === 0) {
        toast.success(`Successfully imported ${successCount} components`);
      } else {
        toast.warning(`Imported ${successCount} components, ${failCount} failed`);
      }

      setReviewingImport(null);
      setImportData(null);
      refetch();
    } catch (error) {
      toast.error('Failed to import components: ' + (error.message || 'Unknown error'));
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
          <Button 
            variant="secondary" 
            onClick={refetch}
            loading={isLoading}
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
        }
      />

      <main className="page-content">
        {!imports || imports.length === 0 ? (
          <EmptyState
            icon={Figma}
            title="No pending imports"
            description="Use the Figma plugin to export components to this admin tool. The plugin will send component data here for review and import."
            action={
              <div className="empty-state-instructions">
                <p style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--color-muted-foreground)',
                  marginTop: 'var(--spacing-md)'
                }}>
                  <strong>How to import:</strong>
                </p>
                <ol style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--color-muted-foreground)',
                  textAlign: 'left',
                  display: 'inline-block',
                  marginTop: 'var(--spacing-sm)'
                }}>
                  <li>Open your Figma file</li>
                  <li>Run the Design System Admin plugin</li>
                  <li>Select components to export</li>
                  <li>Click "Send to Admin"</li>
                </ol>
              </div>
            }
          />
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
    </div>
  );
}
