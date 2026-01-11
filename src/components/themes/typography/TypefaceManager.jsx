/**
 * @chunk 2.21 - TypefaceManager
 * 
 * Manage typefaces (font families) assigned to semantic roles in a theme.
 * Each theme has up to 4 typefaces (one per role: display, text, mono, accent).
 */

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { typefaceService } from '../../../services/typefaceService';
import TypefaceCard from './TypefaceCard';
import TypefaceForm from './TypefaceForm';

/**
 * TypefaceManager component
 * @param {Object} props
 * @param {string} props.themeId - Theme UUID
 * @param {Array} [props.typefaces] - Typefaces for the theme (preferred; pass from parent to keep UI in sync)
 * @param {Function} [props.onRefresh] - Refetch callback for typefaces (preferred)
 * @param {boolean} [props.isLoading] - Loading flag for typefaces (preferred)
 * @param {Error|null} [props.error] - Error for typefaces (preferred)
 */
export default function TypefaceManager({ themeId, typefaces = [], onRefresh, isLoading = false, error = null }) {
  const { refreshTheme } = useThemeContext();
  const [editingTypeface, setEditingTypeface] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const roles = ['display', 'text', 'mono', 'accent'];
  const assignedRoles = new Set(typefaces?.map(t => t.role) || []);

  /**
   * Refresh both local typeface list and theme fonts
   */
  const handleRefresh = async () => {
    await onRefresh?.();
    // Reload theme fonts so preview updates with new typeface
    await refreshTheme();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this typeface? Font files will also be deleted.')) return;
    
    try {
      await typefaceService.deleteTypeface(id);
      await handleRefresh();
    } catch (err) {
      console.error('Failed to delete typeface:', err);
      alert('Failed to delete typeface. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="typeface-manager">
        <div className="error-state">
          <p>Failed to load typefaces</p>
          <button className="btn btn-secondary" onClick={onRefresh}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="typeface-manager">
      <div className="section-header">
        <div>
          <h3 className="section-title">Typefaces</h3>
          <p className="section-description">
            Assign font families to semantic roles for consistent typography.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
          disabled={assignedRoles.size >= 4}
          title={assignedRoles.size >= 4 ? 'All roles assigned' : 'Add typeface'}
        >
          <Plus size={16} />
          Add Typeface
        </button>
      </div>

      {isLoading ? (
        <div className="typeface-loading">
          <Loader2 size={24} className="spin" />
          <span>Loading typefaces...</span>
        </div>
      ) : (
        <div className="typeface-grid">
          {roles.map(role => {
            const typeface = typefaces?.find(t => t.role === role);
            return (
              <TypefaceCard
                key={role}
                role={role}
                typeface={typeface}
                onEdit={() => setEditingTypeface(typeface || { role })}
                onDelete={() => typeface && handleDelete(typeface.id)}
                onUpdate={handleRefresh}
              />
            );
          })}
        </div>
      )}

      {(showAddForm || editingTypeface) && (
        <TypefaceForm
          typeface={editingTypeface}
          themeId={themeId}
          availableRoles={roles.filter(r => !assignedRoles.has(r) || r === editingTypeface?.role)}
          onClose={() => {
            setShowAddForm(false);
            setEditingTypeface(null);
          }}
          onSave={async () => {
            await handleRefresh();
            setShowAddForm(false);
            setEditingTypeface(null);
          }}
        />
      )}
    </div>
  );
}

