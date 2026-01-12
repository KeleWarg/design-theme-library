# Chunk 4.10 — ImageManager

## Purpose
Manage imported images with preview and replace options.

---

## Inputs
- Exported images from Figma

## Outputs
- Image management UI

---

## Dependencies
- Chunk 4.08 must be complete
- Chunk 1.05 must be complete

---

## Implementation Notes

```jsx
// src/components/figma-import/ImageManager.jsx
import { useState } from 'react';
import { Button } from '../ui';
import { TrashIcon, UploadIcon, CheckIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

export default function ImageManager({ images, onUpdate }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleReplace = async (imageId, file) => {
    setUploading(true);
    try {
      const newData = await fileToBase64(file);
      onUpdate(images.map(img => 
        img.node_id === imageId 
          ? { ...img, data: newData, replaced: true, newFile: file } 
          : img
      ));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (imageId) => {
    onUpdate(images.filter(img => img.node_id !== imageId));
    setSelectedImage(null);
  };

  const handleRestore = (imageId) => {
    // Remove replaced flag and newFile
    onUpdate(images.map(img =>
      img.node_id === imageId
        ? { ...img, replaced: false, newFile: undefined }
        : img
    ));
  };

  // Filter out preview images for display
  const displayImages = images.filter(img => !img.node_name.includes('_preview'));

  return (
    <div className="image-manager">
      <div className="manager-header">
        <p>
          Review and manage images extracted from the Figma component.
          You can replace or remove images before import.
        </p>
      </div>

      {displayImages.length === 0 ? (
        <div className="empty-state">
          No images found in this component.
        </div>
      ) : (
        <div className="images-grid">
          {displayImages.map(image => (
            <div 
              key={image.node_id}
              className={cn('image-item', { 
                selected: selectedImage === image.node_id,
                replaced: image.replaced
              })}
              onClick={() => setSelectedImage(image.node_id)}
            >
              <img
                src={image.replaced && image.newFile 
                  ? URL.createObjectURL(image.newFile)
                  : getImageSrc(image)
                }
                alt={image.node_name}
              />
              <div className="image-info">
                <span className="name" title={image.node_name}>
                  {image.node_name}
                </span>
                <span className="size">
                  {image.width}×{image.height} • {image.format}
                </span>
              </div>
              {image.replaced && (
                <span className="replaced-badge">
                  <CheckIcon size={12} /> Replaced
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="image-actions">
          <label className="replace-btn">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleReplace(selectedImage, e.target.files[0]);
                }
              }}
              disabled={uploading}
            />
            <UploadIcon size={16} />
            Replace
          </label>
          
          {images.find(i => i.node_id === selectedImage)?.replaced && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleRestore(selectedImage)}
            >
              Restore Original
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleDelete(selectedImage)}
          >
            <TrashIcon size={16} /> Remove
          </Button>
        </div>
      )}
    </div>
  );
}

function getImageSrc(image) {
  // If we have base64 data directly
  if (image.data) {
    return `data:image/${image.format.toLowerCase()};base64,${image.data}`;
  }
  // If we have a storage path
  if (image.storage_path) {
    const { data } = supabase.storage
      .from('component-images')
      .getPublicUrl(image.storage_path);
    return data.publicUrl;
  }
  return '';
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### Styling
```css
.image-manager {
  padding: 1rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.image-item {
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background: var(--color-muted);
}

.image-item.selected {
  border-color: var(--color-primary);
}

.image-item.replaced {
  border-color: var(--color-success);
}

.image-item img {
  width: 100%;
  height: 100px;
  object-fit: contain;
  background: var(--color-background);
}

.image-info {
  padding: 0.5rem;
  font-size: 0.75rem;
}

.image-info .name {
  display: block;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-info .size {
  color: var(--color-muted-foreground);
}

.replaced-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: var(--color-success);
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.image-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.replace-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
}

.replace-btn input {
  display: none;
}
```

---

## Files Created
- `src/components/figma-import/ImageManager.jsx` — Image manager

---

## Tests

### Unit Tests
- [ ] Shows all images (excluding previews)
- [ ] Selection works
- [ ] Replace uploads new image
- [ ] Delete removes image
- [ ] Restore original works

---

## Time Estimate
2.5 hours
