/**
 * @chunk 3.02 - ComponentCard
 * 
 * Component card for displaying a component in the grid.
 * Shows name, category, status badge, and thumbnail/placeholder.
 * Includes dropdown menu with: Edit, Duplicate, Publish, Archive, Delete actions.
 */

import { useNavigate } from 'react-router-dom';
import { Box, MoreVertical, Edit, Trash2, Copy, Archive, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { componentService } from '../../services/componentService';
import StatusBadge from '../ui/StatusBadge';
import DropdownMenu from '../ui/DropdownMenu';

export default function ComponentCard({ component, onRefresh }) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCardClick = () => {
    if (!isDeleting && !isProcessing) {
      navigate(`/components/${component.id}`);
    }
  };

  const handleDuplicate = async (e) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      const newComponent = await componentService.duplicateComponent(component.id);
      onRefresh?.();
      toast.success(`Component duplicated as "${newComponent.name}"`);
    } catch (error) {
      console.error('Failed to duplicate component:', error);
      toast.error('Failed to duplicate component');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = async (e) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      await componentService.publishComponent(component.id);
      onRefresh?.();
      toast.success('Component published');
    } catch (error) {
      console.error('Failed to publish component:', error);
      toast.error('Failed to publish component');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async (e) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      await componentService.archiveComponent(component.id);
      onRefresh?.();
      toast.success('Component archived');
    } catch (error) {
      console.error('Failed to archive component:', error);
      toast.error('Failed to archive component');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${component.name}"? This cannot be undone.`)) return;
    
    setIsDeleting(true);
    try {
      await componentService.deleteComponent(component.id);
      onRefresh?.();
      toast.success('Component deleted');
    } catch (error) {
      console.error('Failed to delete component:', error);
      toast.error('Failed to delete component');
      setIsDeleting(false);
    }
  };

  // Get thumbnail from component_images if available
  const thumbnail = component.component_images?.[0];
  const thumbnailUrl = thumbnail 
    ? componentService.getImageUrl(thumbnail.storage_path)
    : null;

  return (
    <div 
      className={`component-card ${isDeleting ? 'component-card-deleting' : ''} ${isProcessing ? 'component-card-processing' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Thumbnail/Preview Area */}
      <div className="component-card-preview">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={component.name}
            className="component-card-thumbnail"
          />
        ) : (
          <div className="component-card-placeholder">
            <Box size={32} />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="component-card-body">
        <div className="component-card-header">
          <h3 className="component-card-title">{component.name}</h3>
          <StatusBadge status={component.status} />
        </div>
        
        {component.description && (
          <p className="component-card-description">
            {component.description}
          </p>
        )}
        
        <div className="component-card-footer">
          {component.category && (
            <span className="component-card-category">
              {component.category}
            </span>
          )}
          {component.variants?.length > 0 && (
            <span className="component-card-variants">
              {component.variants.length} variant{component.variants.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Actions Menu */}
      <div className="component-card-actions">
        <DropdownMenu
          trigger={
            <button 
              className="component-card-actions-trigger" 
              onClick={(e) => e.stopPropagation()}
              aria-label="Component actions"
            >
              <MoreVertical size={16} />
            </button>
          }
        >
          <DropdownMenu.Item onClick={() => navigate(`/components/${component.id}`)}>
            <Edit size={14} />
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={handleDuplicate} disabled={isProcessing}>
            <Copy size={14} />
            Duplicate
          </DropdownMenu.Item>
          {component.status === 'draft' && (
            <DropdownMenu.Item onClick={handlePublish} disabled={isProcessing}>
              <Send size={14} />
              Publish
            </DropdownMenu.Item>
          )}
          {component.status !== 'archived' && (
            <DropdownMenu.Item onClick={handleArchive} disabled={isProcessing}>
              <Archive size={14} />
              Archive
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Separator />
          <DropdownMenu.Item danger onClick={handleDelete} disabled={isProcessing}>
            <Trash2 size={14} />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu>
      </div>
    </div>
  );
}

