/**
 * @chunk 2.02 - ThemeCard Component
 * 
 * Individual theme card with color preview, status badge, and actions menu.
 * Displays theme overview and provides quick actions.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MoreVertical, Edit, Copy, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { themeService } from '../../services/themeService';
import StatusBadge from '../ui/StatusBadge';
import DropdownMenu from '../ui/DropdownMenu';

export default function ThemeCard({ theme, onRefresh }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Extract first 5 color tokens for preview
  const colorPreview = theme.tokens
    ?.filter(t => t.category === 'color')
    ?.slice(0, 5)
    ?.map(t => {
      // Handle different value formats
      if (typeof t.value === 'string') return t.value;
      if (t.value?.hex) return t.value.hex;
      if (t.value?.value) return t.value.value;
      return 'var(--color-muted)';
    }) || [];

  const handleCardClick = () => {
    if (!isDeleting && !isProcessing) {
      navigate(`/themes/${theme.id}`);
    }
  };

  const handleDuplicate = async (e) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      await themeService.duplicateTheme(theme.id, `${theme.name} (Copy)`);
      onRefresh?.();
      toast.success('Theme duplicated successfully');
    } catch (error) {
      console.error('Failed to duplicate theme:', error);
      toast.error('Failed to duplicate theme');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetDefault = async (e) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      await themeService.setDefaultTheme(theme.id);
      onRefresh?.();
      toast.success('Default theme updated');
    } catch (error) {
      console.error('Failed to set default theme:', error);
      toast.error('Failed to set default theme');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${theme.name}"? This cannot be undone.`)) return;
    
    setIsDeleting(true);
    try {
      await themeService.deleteTheme(theme.id);
      onRefresh?.();
      toast.success('Theme deleted');
    } catch (error) {
      console.error('Failed to delete theme:', error);
      toast.error('Failed to delete theme');
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className={`theme-card ${isDeleting ? 'theme-card-deleting' : ''} ${isProcessing ? 'theme-card-processing' : ''}`}
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
      {/* Color Preview Strip */}
      <div className="theme-card-colors">
        {colorPreview.length > 0 ? (
          colorPreview.map((color, i) => (
            <div 
              key={i} 
              className="theme-card-color-swatch" 
              style={{ backgroundColor: color }} 
            />
          ))
        ) : (
          <div className="theme-card-no-colors">No colors defined</div>
        )}
      </div>

      {/* Card Content */}
      <div className="theme-card-body">
        <div className="theme-card-header">
          <h3 className="theme-card-title">{theme.name}</h3>
          {theme.is_default && (
            <Star className="theme-card-default-star" size={16} fill="currentColor" />
          )}
        </div>
        
        <p className="theme-card-description">
          {theme.description || 'No description'}
        </p>
        
        <div className="theme-card-footer">
          <StatusBadge status={theme.status} />
          <span className="theme-card-token-count">
            {theme.tokenCount || theme.tokens?.length || 0} tokens
          </span>
        </div>
      </div>

      {/* Actions Menu */}
      <div className="theme-card-actions">
        <DropdownMenu
          trigger={
            <button 
              className="theme-card-actions-trigger" 
              onClick={(e) => e.stopPropagation()}
              aria-label="Theme actions"
            >
              <MoreVertical size={16} />
            </button>
          }
        >
          <DropdownMenu.Item onClick={() => navigate(`/themes/${theme.id}`)}>
            <Edit size={14} />
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={handleDuplicate} disabled={isProcessing}>
            <Copy size={14} />
            Duplicate
          </DropdownMenu.Item>
          {!theme.is_default && (
            <DropdownMenu.Item onClick={handleSetDefault} disabled={isProcessing}>
              <CheckCircle size={14} />
              Set as Default
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


