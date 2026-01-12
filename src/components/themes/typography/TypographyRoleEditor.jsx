/**
 * @chunk 2.24 - TypographyRoleEditor
 * 
 * Configure typography roles (semantic text styles) for a theme.
 * Manages the 11 standard typography roles mapped to typeface roles.
 */

import { useMemo, useState } from 'react';
import { RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { useTypographyRoles } from '../../../hooks/useTypographyRoles';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { typefaceService } from '../../../services/typefaceService';
import TypographyRoleModal from './TypographyRoleModal';
import Button from '../../ui/Button';
import { TYPOGRAPHY_ROLE_REGISTRY } from '../../../lib/typographyRoleRegistry';

/**
 * Universal role definitions (titles) — same for all themes.
 * Theme-specific overrides live in `typography_roles`.
 */
const ROLE_DEFINITIONS = TYPOGRAPHY_ROLE_REGISTRY.map(r => ({
  name: r.name,
  typefaceRole: r.typefaceRole,
  defaultSize: r.defaultSize,
  defaultWeight: r.defaultWeight,
  defaultLineHeight: r.defaultLineHeight,
  defaultLetterSpacing: r.defaultLetterSpacing,
  description: r.description,
}));

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
  const { refreshTheme } = useThemeContext();
  const [editingRole, setEditingRole] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  const standardRoleMap = useMemo(() => {
    return ROLE_DEFINITIONS.reduce((acc, def) => {
      acc[def.name] = def;
      return acc;
    }, {});
  }, []);

  const sortedRoles = useMemo(() => {
    const existing = roles || [];
    const byName = new Map(existing.map(r => [r.role_name, r]));

    // Always show the universal registry roles, even if not yet created in DB.
    const registryRows = ROLE_DEFINITIONS.map(def => {
      const row = byName.get(def.name);
      if (row) return row;
      // Placeholder role (not yet created). Values intentionally left null
      // so UI can show defaults and user can "leave blank" to keep defaults.
      return {
        id: null,
        theme_id: themeId,
        role_name: def.name,
        typeface_role: def.typefaceRole,
        font_size: null,
        font_size_tablet: null,
        font_size_mobile: null,
        font_weight: def.defaultWeight ?? 400,
        line_height: def.defaultLineHeight ?? '1.5',
        letter_spacing: def.defaultLetterSpacing ?? 'normal',
        __isPlaceholder: true,
      };
    });

    // Append any legacy/custom roles not in registry at the bottom.
    const registryNames = new Set(ROLE_DEFINITIONS.map(d => d.name));
    const custom = existing.filter(r => !registryNames.has(r.role_name));

    return [...registryRows, ...custom];
  }, [roles, themeId]);

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
      // If editing an existing role, update by id (supports renaming role_name safely).
      if (editingRole?.id) {
        await typefaceService.updateTypographyRole(editingRole.id, roleData);
      } else {
        // Creating a placeholder or new role
        await typefaceService.createTypographyRole(themeId, roleData);
      }
      refetch();
      // Ensure ThemeContext + CSS variables pick up the newly synced composite tokens
      await refreshTheme();
      setEditingRole(null);
    } catch (err) {
      console.error('Failed to save typography role:', err);
      throw err;
    }
  };

  const handleDelete = async (role) => {
    if (!role?.id) return;
    await typefaceService.deleteTypographyRole(role.id);
    refetch();
    await refreshTheme();
    setEditingRole(null);
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
      await refreshTheme();
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
      await refreshTheme();
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
            Define semantic typography roles. These generate the composite typography tokens for this theme.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
      </div>

      {isLoading ? (
        <div className="typography-role-loading">
          <Loader2 size={24} className="spin" />
          <span>Loading typography roles...</span>
        </div>
      ) : (
        <div className="typography-role-list">
          {sortedRoles.map(role => {
            const def = standardRoleMap[role.role_name];
            const typeface = getTypeface(role.typeface_role || def?.typefaceRole || 'text');
            return (
              <TypographyRoleRow
                key={role.id || role.role_name}
                definition={def}
                role={role}
                typeface={typeface}
                onEdit={() => setEditingRole(role)}
              />
            );
          })}
        </div>
      )}

      {editingRole && (
        <TypographyRoleModal
          role={editingRole}
          typefaces={typefaces}
          defaultTypefaceRole={standardRoleMap[editingRole.role_name]?.typefaceRole}
          onClose={() => setEditingRole(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

/**
 * Individual typography role row
 */
function TypographyRoleRow({ definition, role, typeface, onEdit }) {
  const fontSize = role?.font_size || definition?.defaultSize || '1rem';
  const fontWeight = role?.font_weight || definition?.defaultWeight || 400;
  const lineHeight = role?.line_height || definition?.defaultLineHeight || '1.5';
  const letterSpacing = role?.letter_spacing || definition?.defaultLetterSpacing || 'normal';
  
  // Build font family string
  const fontFamily = typeface 
    ? `'${typeface.family}', ${typeface.fallback || 'sans-serif'}` 
    : 'inherit';

  return (
    <div className="typography-role-row" onClick={onEdit} role="button" tabIndex={0}>
      <div className="typography-role-info">
        <span className="typography-role-name">
          {role.role_name}
          {!definition && <span className="typography-role-custom-tag">Custom</span>}
        </span>
        <span className="typography-role-desc">{definition?.description || 'Custom role'}</span>
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


