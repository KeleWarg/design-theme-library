/**
 * @chunk 4.06 - FigmaImportPage
 * 
 * Modal for reviewing a specific import and its components.
 * (Renamed from ImportReviewModal to avoid conflict with component-level review modal)
 */

import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatDate } from '../../lib/utils';
import ImportReviewModal from './ImportReviewModal';

export default function ImportListModal({ 
  import: importRecord,
  components = [],
  images = [],
  onClose,
  onImport
}) {
  const [selectedComponents, setSelectedComponents] = useState(
    components.map(c => c.id)
  );
  const [reviewingComponent, setReviewingComponent] = useState(null);

  const toggleComponent = (componentId) => {
    setSelectedComponents(prev => 
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  const handleImportSelected = () => {
    const selected = components.filter(c => selectedComponents.includes(c.id));
    onImport({
      importId: importRecord.id,
      components: selected
    });
  };

  const componentImages = (componentId) => {
    return images.filter(img => 
      img.node_id && componentId && img.node_id.startsWith(componentId)
    );
  };

  return (
    <Modal 
      open={true} 
      onClose={onClose}
      title="Review Import"
      size="large"
    >
      <div className="import-review-modal">
        <div className="import-review-modal-header">
          <div className="import-review-modal-meta">
            <h4>{importRecord.metadata?.fileName || 'Untitled Import'}</h4>
            <p className="import-review-modal-date">
              Exported: {formatDate(importRecord.metadata?.exportedAt, {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </p>
          </div>
          <div className="import-review-modal-stats">
            <span>{components.length} components</span>
            <span>{images.length} images</span>
          </div>
        </div>

        <div className="import-review-modal-components">
          <div className="import-review-modal-select-all">
            <label>
              <input
                type="checkbox"
                checked={selectedComponents.length === components.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedComponents(components.map(c => c.id));
                  } else {
                    setSelectedComponents([]);
                  }
                }}
              />
              <span>
                Select All ({selectedComponents.length}/{components.length})
              </span>
            </label>
          </div>

          <div className="import-review-modal-list">
            {components.map(component => {
              const isSelected = selectedComponents.includes(component.id);
              const compImages = componentImages(component.id);
              
              return (
                <div 
                  key={component.id}
                  className={`import-review-modal-item ${isSelected ? 'selected' : ''}`}
                >
                  <label className="import-review-modal-item-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleComponent(component.id)}
                    />
                  </label>
                  
                  <div 
                    className="import-review-modal-item-content"
                    onClick={() => setReviewingComponent(component)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="import-review-modal-item-header">
                      <h5>{component.name || 'Unnamed Component'}</h5>
                      {component.variant_count > 0 && (
                        <span className="import-review-modal-item-variants">
                          {component.variant_count} variants
                        </span>
                      )}
                    </div>
                    
                    {component.description && (
                      <p className="import-review-modal-item-description">
                        {component.description}
                      </p>
                    )}

                    {compImages.length > 0 && (
                      <div className="import-review-modal-item-images">
                        {compImages.slice(0, 3).map((img, idx) => (
                          <div key={idx} className="import-review-modal-item-image">
                            <ImageIcon size={16} />
                            <span>{img.variant_name || `Image ${idx + 1}`}</span>
                          </div>
                        ))}
                        {compImages.length > 3 && (
                          <span className="import-review-modal-item-more">
                            +{compImages.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="import-review-modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleImportSelected}
            disabled={selectedComponents.length === 0}
          >
            Import Selected ({selectedComponents.length})
          </Button>
        </div>
      </div>

      {reviewingComponent && (
        <ImportReviewModal
          component={reviewingComponent}
          images={componentImages(reviewingComponent.id)}
          onClose={() => setReviewingComponent(null)}
          onImport={(result) => {
            // Handle component import
            setReviewingComponent(null);
            // Could trigger parent onImport or handle separately
          }}
        />
      )}
    </Modal>
  );
}

