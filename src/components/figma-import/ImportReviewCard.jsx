/**
 * @chunk 4.07 - ImportReviewCard
 * 
 * Card component for displaying a single imported component with preview,
 * stats, and review/import actions.
 */

import { Box, Layers2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import Button from '../ui/Button';
import { storage, BUCKETS } from '../../lib/storage';

export default function ImportReviewCard({ 
  component, 
  images = [], 
  onReview, 
  onQuickImport 
}) {
  // Find preview image (one with '_preview' in node_name)
  const previewImage = images.find(img => 
    img.node_name && img.node_name.includes('_preview')
  ) || images[0]; // Fallback to first image if no preview

  const getImageUrl = (storagePath) => {
    if (!storagePath) return null;
    return storage.getPublicUrl(BUCKETS.COMPONENT_IMAGES, storagePath);
  };

  const imageUrl = previewImage?.storage_path 
    ? getImageUrl(previewImage.storage_path) 
    : null;

  const propertyCount = component.properties?.length || 0;
  const variantCount = component.variants?.length || 0;
  const boundVariablesCount = component.bound_variables?.length || 0;
  const imageCount = images.length;

  return (
    <div className="import-review-card">
      <div className="card-preview">
        {imageUrl ? (
          <img 
            src={imageUrl}
            alt={component.name || 'Component preview'}
            loading="lazy"
          />
        ) : (
          <div className="no-preview">
            <Box size={32} />
          </div>
        )}
      </div>

      <div className="card-content">
        <h3 className="card-title">{component.name || 'Unnamed Component'}</h3>
        <p className="card-description">
          {component.description || 'No description'}
        </p>
        
        <div className="card-stats">
          <span title="Properties">
            <Layers2 size={14} />
            {propertyCount} {propertyCount === 1 ? 'prop' : 'props'}
          </span>
          <span title="Variants">
            <Layers2 size={14} />
            {variantCount} {variantCount === 1 ? 'variant' : 'variants'}
          </span>
          <span title="Images">
            <ImageIcon size={14} />
            {imageCount} {imageCount === 1 ? 'image' : 'images'}
          </span>
          <span title="Token bindings">
            <LinkIcon size={14} />
            {boundVariablesCount} {boundVariablesCount === 1 ? 'token' : 'tokens'}
          </span>
        </div>

        <div className="card-type">
          {component.component_type === 'COMPONENT_SET' 
            ? 'Component Set' 
            : 'Component'}
        </div>
      </div>

      <div className="card-actions">
        <Button variant="ghost" onClick={() => onReview?.(component)}>
          Review
        </Button>
        <Button onClick={() => onQuickImport?.(component)}>
          Import
        </Button>
      </div>
    </div>
  );
}
