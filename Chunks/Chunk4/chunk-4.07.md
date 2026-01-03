# Chunk 4.07 — ImportReviewCard

## Purpose
Card showing imported component summary with review action.

---

## Inputs
- Imported component data
- Associated images

## Outputs
- ImportReviewCard component

---

## Dependencies
- Chunk 4.06 must be complete

---

## Implementation Notes

```jsx
// src/components/figma-import/ImportReviewCard.jsx
import { Button } from '../ui';
import { BoxIcon, LayersIcon, ImageIcon, LinkIcon } from 'lucide-react';

export default function ImportReviewCard({ component, images, onReview, onQuickImport }) {
  const previewImage = images.find(i => i.node_name.includes('_preview'));

  return (
    <div className="import-review-card">
      <div className="card-preview">
        {previewImage ? (
          <img 
            src={getImageUrl(previewImage.storage_path)}
            alt={component.name}
          />
        ) : (
          <div className="no-preview">
            <BoxIcon size={32} />
          </div>
        )}
      </div>

      <div className="card-content">
        <h3>{component.name}</h3>
        <p className="description">
          {component.description || 'No description'}
        </p>
        
        <div className="card-stats">
          <span title="Properties">
            <LayersIcon size={14} />
            {component.properties?.length || 0} props
          </span>
          <span title="Variants">
            <LayersIcon size={14} />
            {component.variants?.length || 0} variants
          </span>
          <span title="Images">
            <ImageIcon size={14} />
            {images.length} images
          </span>
          <span title="Token bindings">
            <LinkIcon size={14} />
            {component.bound_variables?.length || 0} tokens
          </span>
        </div>

        <div className="card-type">
          {component.component_type === 'COMPONENT_SET' 
            ? 'Component Set' 
            : 'Component'}
        </div>
      </div>

      <div className="card-actions">
        <Button variant="ghost" onClick={onReview}>
          Review
        </Button>
        <Button onClick={onQuickImport}>
          Import
        </Button>
      </div>
    </div>
  );
}

function getImageUrl(storagePath) {
  // Get public URL from Supabase storage
  const { data } = supabase.storage
    .from('component-images')
    .getPublicUrl(storagePath);
  return data.publicUrl;
}
```

### Styling
```css
.import-review-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-card);
}

.card-preview {
  width: 120px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--color-muted-foreground);
}

.card-stats span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
```

---

## Files Created
- `src/components/figma-import/ImportReviewCard.jsx` — Review card

---

## Tests

### Unit Tests
- [ ] Shows preview image or placeholder
- [ ] Shows component name and description
- [ ] Shows stats correctly
- [ ] Review button works
- [ ] Import button works

---

## Time Estimate
2 hours
