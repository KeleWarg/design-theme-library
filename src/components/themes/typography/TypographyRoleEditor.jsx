/**
 * @chunk 2.24 - TypographyRoleEditor
 * 
 * Configure typography roles (semantic text styles) for a theme.
 * Manages the 11 standard typography roles mapped to typeface roles.
 */

import { useState } from 'react';
import { RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { useTypographyRoles } from '../../../hooks/useTypographyRoles';
import { typefaceService } from '../../../services/typefaceService';
import TypographyRoleModal from './TypographyRoleModal';
import Button from '../../ui/Button';

/**
 * Standard typography role definitions
 * Each role maps to a typeface role (display, text, mono)
 */
const ROLE_DEFINITIONS = [
  { name: 'display', typefaceRole: 'display', defaultSize: '3rem', defaultWeight: 700, description: 'Hero headlines' },
  { name: 'heading-xl', typefaceRole: 'display', defaultSize: '2.25rem', defaultWeight: 700, description: 'Page titles' },
  { name: 'heading-lg', typefaceRole: 'display', defaultSize: '1.875rem', defaultWeight: 600, description: 'Section headers' },
  { name: 'heading-md', typefaceRole: 'display', defaultSize: '1.5rem', defaultWeight: 600, description: 'Card headers' },
  { name: 'heading-sm', typefaceRole: 'display', defaultSize: '1.25rem', defaultWeight: 600, description: 'Subheadings' },
  { name: 'body-lg', typefaceRole: 'text', defaultSize: '1.125rem', defaultWeight: 400, description: 'Intro paragraphs' },
  { name: 'body-md', typefaceRole: 'text', defaultSize: '1rem', defaultWeight: 400, description: 'Body copy' },
  { name: 'body-sm', typefaceRole: 'text', defaultSize: '0.875rem', defaultWeight: 400, description: 'Secondary text' },
  { name: 'label', typefaceRole: 'text', defaultSize: '0.875rem', defaultWeight: 500, description: 'Form labels' },
  { name: 'caption', typefaceRole: 'text', defaultSize: '0.75rem', defaultWeight: 400, description: 'Image captions' },
  { name: 'mono', typefaceRole: 'mono', defaultSize: '0.875rem', defaultWeight: 400, description: 'Code blocks' },
];

/**
 * Get font weight label from numeric value
 */
function getWeightLabel(weight) {
  const labels = {
    100: 'Thin',
    200: 'Extra Light',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'Semibold',
    700: 'Bold',
    800: 'Extra Bold',
    900: 'Black'
  };
  return labels[weight] || weight;
}

/**
 * TypographyRoleEditor component
 * @param {Object} props
 * @param {string} props.themeId - Theme UUID
 * @param {Array} props.typefaces - Array of typefaces for the theme
 */
export default function TypographyRoleEditor({ themeId, typefaces }) {
  const { data: roles, isLoading, error, refetch } = useTypographyRoles(themeId);
  const [editingRole, setEditingRole] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  /**
   * Get typeface by role (display, text, mono, accent)
   */
  const getTypeface = (typefaceRole) => {
    return typefaces?.find(t => t.role === typefaceRole);
  };

  /**
   * Save typography role (create or update)
   */
  const handleSave = async (roleData) => {
    try {
      await typefaceService.upsertTypographyRole(themeId, roleData);
      refetch();
      setEditingRole(null);
    } catch (err) {
      console.error('Failed to save typography role:', err);
      throw err;
    }
  };

  /**
   * Reset all roles to defaults
   */
  const handleResetToDefaults = async () => {
    if (!window.confirm('Reset all typography roles to defaults? This will overwrite any customizations.')) {
      return;
    }

    setIsResetting(true);
    try {
      // Delete existing roles first
      if (roles?.length) {
        await Promise.all(roles.map(role => typefaceService.deleteTypographyRole(role.id)));
      }
      // Create default roles
      await typefaceService.createDefaultTypographyRoles(themeId);
      refetch();
    } catch (err) {
      console.error('Failed to reset typography roles:', err);
      alert('Failed to reset typography roles. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  /**
   * Initialize roles if none exist
   */
  const handleInitialize = async () => {
    setIsResetting(true);
    try {
      await typefaceService.createDefaultTypographyRoles(themeId);
      refetch();
    } catch (err) {
      console.error('Failed to initialize typography roles:', err);
      alert('Failed to initialize typography roles. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  if (error) {
    return (
      <div className="typography-role-editor">
        <div className="error-state">
          <AlertCircle size={24} />
          <p>Failed to load typography roles</p>
          <Button variant="secondary" onClick={refetch}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="typography-role-editor">
      <div className="section-header">
        <div>
          <h3 className="section-title">Typography Scale</h3>
          <p className="section-description">
            Define semantic typography styles for consistent text hierarchy.
          </p>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={roles?.length ? handleResetToDefaults : handleInitialize}
          disabled={isResetting || isLoading}
        >
          {isResetting ? (
            <Loader2 size={16} className="spin" />
          ) : (
            <RotateCcw size={16} />
          )}
          {roles?.length ? 'Reset to Defaults' : 'Initialize Defaults'}
        </Button>
      </div>

      {isLoading ? (
        <div className="typography-role-loading">
          <Loader2 size={24} className="spin" />
          <span>Loading typography roles...</span>
        </div>
      ) : !roles?.length ? (
        <div className="typography-role-empty">
          <p>No typography roles configured yet.</p>
          <Button variant="primary" onClick={handleInitialize} disabled={isResetting}>
            {isResetting ? <Loader2 size={16} className="spin" /> : null}
            Initialize Default Roles
          </Button>
        </div>
      ) : (
        <div className="typography-role-list">
          {ROLE_DEFINITIONS.map(def => {
            const role = roles?.find(r => r.role_name === def.name);
            const typeface = getTypeface(role?.typeface_role || def.typefaceRole);
            
            return (
              <TypographyRoleRow
                key={def.name}
                definition={def}
                role={role}
                typeface={typeface}
                onEdit={() => setEditingRole(role || {
                  role_name: def.name,
                  typeface_role: def.typefaceRole,
                  font_size: def.defaultSize,
                  font_weight: def.defaultWeight,
                  line_height: '1.5'
                })}
              />
            );
          })}
        </div>
      )}

      {editingRole && (
        <TypographyRoleModal
          role={editingRole}
          typefaces={typefaces}
          onClose={() => setEditingRole(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

/**
 * Individual typography role row
 */
function TypographyRoleRow({ definition, role, typeface, onEdit }) {
  const fontSize = role?.font_size || definition.defaultSize;
  const fontWeight = role?.font_weight || definition.defaultWeight;
  const lineHeight = role?.line_height || '1.5';
  const letterSpacing = role?.letter_spacing || 'normal';
  
  // Build font family string
  const fontFamily = typeface 
    ? `'${typeface.family}', ${typeface.fallback || 'sans-serif'}` 
    : 'inherit';

  return (
    <div className="typography-role-row" onClick={onEdit} role="button" tabIndex={0}>
      <div className="typography-role-info">
        <span className="typography-role-name">{definition.name}</span>
        <span className="typography-role-desc">{definition.description}</span>
      </div>
      
      <div 
        className="typography-role-preview"
        style={{
          fontFamily,
          fontSize,
          fontWeight,
          lineHeight,
          letterSpacing: letterSpacing !== 'normal' ? letterSpacing : undefined
        }}
      >
        The quick brown fox
      </div>
      
      <div className="typography-role-specs">
        <span className="typography-role-spec">{fontSize}</span>
        <span className="typography-role-spec">{getWeightLabel(fontWeight)}</span>
        <span className="typography-role-spec">{lineHeight}</span>
      </div>
    </div>
  );
}

