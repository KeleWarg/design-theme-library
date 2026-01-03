# Chunk 4.06 — FigmaImportPage

## Purpose
Page to receive and list imported components from Figma.

---

## Inputs
- API endpoint receiving Figma plugin data
- componentService

## Outputs
- FigmaImportPage listing pending imports

---

## Dependencies
- Chunk 1.11 must be complete
- Chunk 1.10 must be complete

---

## Implementation Notes

```jsx
// src/pages/FigmaImportPage.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFigmaImport } from '../hooks/useFigmaImport';
import { PageHeader, Button } from '../components/ui';
import ImportReviewCard from '../components/figma-import/ImportReviewCard';
import ImportReviewModal from '../components/figma-import/ImportReviewModal';
import { ImportSkeleton } from '../components/ui/Skeleton';
import { formatDate } from '../lib/utils';
import { toast } from 'sonner';

export default function FigmaImportPage() {
  const { importId } = useParams();
  const navigate = useNavigate();
  const { data: importData, isLoading, error } = useFigmaImport(importId);
  const [reviewingComponent, setReviewingComponent] = useState(null);

  const handleImportAll = async () => {
    try {
      for (const component of importData.components) {
        await handleImportComponent(component);
      }
      toast.success(`Imported ${importData.components.length} components`);
      navigate('/components');
    } catch (error) {
      toast.error('Failed to import some components');
    }
  };

  const handleImportComponent = async (component) => {
    // Implementation in chunk 4.13
  };

  if (isLoading) return <ImportSkeleton />;
  if (error) return <div>Error loading import: {error.message}</div>;

  return (
    <div className="figma-import-page">
      <PageHeader
        title="Review Figma Import"
        description={`${importData.components.length} components from ${importData.metadata.fileName}`}
      />

      <div className="import-meta">
        <span>Imported: {formatDate(importData.metadata.exportedAt)}</span>
        <span>File: {importData.metadata.fileName}</span>
        <span>Status: {importData.status}</span>
      </div>

      <div className="import-actions">
        <Button onClick={handleImportAll}>
          Import All ({importData.components.length})
        </Button>
      </div>

      <div className="import-list">
        {importData.components.map(component => (
          <ImportReviewCard
            key={component.id}
            component={component}
            images={importData.images.filter(i => 
              i.nodeId.startsWith(component.figma_id)
            )}
            onReview={() => setReviewingComponent(component)}
          />
        ))}
      </div>

      {reviewingComponent && (
        <ImportReviewModal
          component={reviewingComponent}
          images={importData.images}
          onClose={() => setReviewingComponent(null)}
          onImport={(result) => {
            setReviewingComponent(null);
            toast.success('Component imported');
          }}
        />
      )}
    </div>
  );
}
```

### useFigmaImport Hook
```javascript
// src/hooks/useFigmaImport.js
import useSWR from 'swr';
import { supabase } from '../lib/supabase';

export function useFigmaImport(importId) {
  return useSWR(importId ? ['figma-import', importId] : null, async () => {
    // Get import record
    const { data: importRecord, error: importError } = await supabase
      .from('figma_imports')
      .select('*')
      .eq('id', importId)
      .single();

    if (importError) throw importError;

    // Get components
    const { data: components } = await supabase
      .from('figma_import_components')
      .select('*')
      .eq('import_id', importId);

    // Get images
    const { data: images } = await supabase
      .from('figma_import_images')
      .select('*')
      .eq('import_id', importId);

    return {
      ...importRecord,
      components: components || [],
      images: images || [],
      metadata: {
        fileKey: importRecord.file_key,
        fileName: importRecord.file_name,
        exportedAt: importRecord.exported_at,
      }
    };
  });
}
```

---

## Files Created
- `src/pages/FigmaImportPage.jsx` — Import review page
- `src/hooks/useFigmaImport.js` — Import data hook

---

## Tests

### Unit Tests
- [ ] Loads import data
- [ ] Shows component list
- [ ] Import all button works
- [ ] Opens review modal

---

## Time Estimate
2 hours
